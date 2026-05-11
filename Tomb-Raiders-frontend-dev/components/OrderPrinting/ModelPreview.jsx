import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const SUPPORTED_EXTENSIONS = ['stl', 'obj', 'glb', 'gltf'];

function getExtension(fileName) {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

function formatFileSize(size) {
  if (!size) {
    return '0 KB';
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function hasWebGLSupport() {
  if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
    return false;
  }

  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }

    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value && typeof value.dispose === 'function') {
            value.dispose();
          }
        });
        material.dispose();
      });
    }
  });
}

function frameObject(object, camera, controls) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  const cameraDistance = maxDimension * 2.2;

  object.position.sub(center);
  camera.position.set(cameraDistance, cameraDistance * 0.7, cameraDistance);
  camera.near = maxDimension / 100;
  camera.far = maxDimension * 100;
  camera.updateProjectionMatrix();

  controls.target.set(0, 0, 0);
  controls.minDistance = maxDimension * 0.15;
  controls.maxDistance = maxDimension * 8;
  controls.update();
}

function syncControlsSize(controls, preview, width, height) {
  controls.handleResize();

  if (!controls.screen.width || !controls.screen.height) {
    const rect = preview.getBoundingClientRect();
    controls.screen.left = rect.left || 0;
    controls.screen.top = rect.top || 0;
    controls.screen.width = width;
    controls.screen.height = height;
  }
}

async function loadModel(fileUrl, extension) {
  if (extension === 'stl') {
    const geometry = await new STLLoader().loadAsync(fileUrl);
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.12,
      roughness: 0.55,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(geometry, material);
  }

  if (extension === 'obj') {
    const object = await new OBJLoader().loadAsync(fileUrl);
    object.traverse((child) => {
      if (child.isMesh && !child.material) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#36A66A',
          roughness: 0.6,
          side: THREE.DoubleSide,
        });
      }
    });
    return object;
  }

  const gltf = await new GLTFLoader().loadAsync(fileUrl);
  return gltf.scene;
}

function ModelPreview({ file }) {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const extension = useMemo(() => getExtension(file.name), [file.name]);
  const isSupported = SUPPORTED_EXTENSIONS.includes(extension);
  const [status, setStatus] = useState(
    isSupported
      ? '마우스로 회전하고 휠로 확대해 모델을 확인할 수 있습니다.'
      : '지원하지 않는 파일 형식입니다.',
  );

  useEffect(() => {
    setStatus(
      isSupported
        ? '마우스로 회전하고 휠로 확대해 모델을 확인할 수 있습니다.'
        : '지원하지 않는 파일 형식입니다.',
    );
  }, [isSupported, file]);

  useEffect(() => {
    if (!isSupported || !canvasRef.current || !previewRef.current) {
      return undefined;
    }

    if (!hasWebGLSupport()) {
      setStatus('이 브라우저에서는 WebGL 3D 미리보기를 사용할 수 없습니다.');
      return undefined;
    }

    const fileUrl = URL.createObjectURL(file);
    const canvas = canvasRef.current;
    const preview = previewRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas,
      preserveDrawingBuffer: true,
    });
    const controls = new TrackballControls(camera, renderer.domElement);
    const ambientLight = new THREE.HemisphereLight('#FFFFFF', '#94A3B8', 2.4);
    const keyLight = new THREE.DirectionalLight('#FFFFFF', 2.6);
    let model = null;
    let animationFrameId = 0;
    let resizeObserver = null;
    let isDisposed = false;

    scene.background = new THREE.Color('#E2E8F0');
    keyLight.position.set(4, 7, 5);
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.08;

    scene.add(ambientLight);
    scene.add(keyLight);

    const resizeRenderer = () => {
      const width = preview.clientWidth || 520;
      const height = preview.clientHeight || 360;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      syncControlsSize(controls, preview, width, height);
    };

    const renderScene = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(renderScene);
    };

    resizeRenderer();
    renderScene();

    if (window.ResizeObserver) {
      resizeObserver = new window.ResizeObserver(resizeRenderer);
      resizeObserver.observe(preview);
    } else {
      window.addEventListener('resize', resizeRenderer);
    }

    setStatus('모델 파일을 불러오는 중입니다...');

    loadModel(fileUrl, extension)
      .then((loadedModel) => {
        if (isDisposed) {
          disposeObject(loadedModel);
          return;
        }

        model = loadedModel;
        scene.add(model);
        frameObject(model, camera, controls);
        setStatus('마우스로 회전하고 휠로 확대해 모델을 확인할 수 있습니다.');
      })
      .catch(() => {
        if (!isDisposed) {
          setStatus('모델을 불러오지 못했습니다. STL, OBJ, GLB, GLTF 파일인지 확인해 주세요.');
        }
      });

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (model) {
        scene.remove(model);
        disposeObject(model);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', resizeRenderer);
      }
      URL.revokeObjectURL(fileUrl);
    };
  }, [extension, file, isSupported]);

  return (
    <section
      data-testid="model-preview"
      style={{
        width: '100%',
        marginTop: 24,
        border: '1px solid #D8DEE8',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F8FAFC',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderBottom: '1px solid #D8DEE8',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>3D 미리보기</h3>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748B' }}>
            {file.name} · {formatFileSize(file.size)}
          </p>
        </div>
        <span
          style={{
            flex: '0 0 auto',
            padding: '4px 8px',
            border: '1px solid #BFD8C8',
            borderRadius: 999,
            color: '#1E7D45',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {extension.toUpperCase()}
        </span>
      </div>

      <div
        ref={previewRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          minHeight: 300,
        }}
      >
        {isSupported ? (
          <canvas
            ref={canvasRef}
            aria-label="3D 모델 미리보기"
            style={{ display: 'block', width: '100%', height: '100%' }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: 24,
              color: '#475569',
              textAlign: 'center',
            }}
          >
            STL, OBJ, GLB, GLTF 파일만 미리보기로 확인할 수 있습니다.
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
            padding: '8px 10px',
            borderRadius: 6,
            backgroundColor: 'rgba(15, 23, 42, 0.72)',
            color: '#FFFFFF',
            fontSize: 12,
            lineHeight: 1.45,
            pointerEvents: 'none',
          }}
        >
          {status}
        </div>
      </div>
    </section>
  );
}

ModelPreview.propTypes = {
  file: PropTypes.instanceOf(File).isRequired,
};

export default ModelPreview;
