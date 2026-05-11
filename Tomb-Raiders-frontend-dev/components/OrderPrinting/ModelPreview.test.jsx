import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ModelPreview from './ModelPreview';

const resizeObserverObserve = vi.fn();
const resizeObserverDisconnect = vi.fn();

// Three.js 및 관련 로더/컨트롤 모킹
vi.mock('three', () => {
  const Scene = vi.fn().mockImplementation(function SceneMock() {
    return {
      background: null,
      add: vi.fn(),
      remove: vi.fn(),
    };
  });
  const PerspectiveCamera = vi.fn().mockImplementation(function PerspectiveCameraMock() {
    return {
      aspect: 1,
      updateProjectionMatrix: vi.fn(),
      position: { set: vi.fn() },
    };
  });
  const WebGLRenderer = vi.fn().mockImplementation(function WebGLRendererMock() {
    return {
      setPixelRatio: vi.fn(),
      setSize: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      domElement: document.createElement('canvas'),
    };
  });
  const HemisphereLight = vi.fn().mockImplementation(function HemisphereLightMock() {
    return {};
  });
  const DirectionalLight = vi.fn().mockImplementation(function DirectionalLightMock() {
    return {
      position: { set: vi.fn() },
    };
  });
  const GridHelper = vi.fn().mockImplementation(function GridHelperMock() {
    return {
      position: { y: 0 },
    };
  });
  const Color = vi.fn().mockImplementation(function ColorMock() {
    return {};
  });
  const Box3 = vi.fn().mockImplementation(function Box3Mock() {
    return {
      setFromObject: vi.fn().mockReturnThis(),
      getSize: vi.fn().mockReturnValue({ x: 10, y: 10, z: 10 }),
      getCenter: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    };
  });
  const Vector3 = vi.fn().mockImplementation(function Vector3Mock() {
    return {
      sub: vi.fn(),
      set: vi.fn(),
    };
  });
  const Mesh = vi.fn().mockImplementation(function MeshMock() {
    return {
      position: { sub: vi.fn() },
      traverse: vi.fn(),
    };
  });
  const MeshStandardMaterial = vi.fn().mockImplementation(function MeshStandardMaterialMock() {
    return {};
  });

  return {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    HemisphereLight,
    DirectionalLight,
    GridHelper,
    Color,
    Box3,
    Vector3,
    Mesh,
    MeshStandardMaterial,
    DoubleSide: 2,
  };
});

const { mockTrackballControls } = vi.hoisted(() => ({
  mockTrackballControls: vi.fn().mockImplementation(function TrackballControlsMock() {
    return {
      staticMoving: false,
      dynamicDampingFactor: 0,
      screen: { left: 0, top: 0, width: 0, height: 0 },
      target: { set: vi.fn() },
      minDistance: 0,
      maxDistance: 0,
      update: vi.fn(),
      handleResize: vi.fn(),
      dispose: vi.fn(),
    };
  }),
}));

vi.mock('three/examples/jsm/controls/TrackballControls.js', () => {
  return {
    TrackballControls: mockTrackballControls,
  };
});

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => {
  return {
    GLTFLoader: vi.fn().mockImplementation(function GLTFLoaderMock() {
      return {
        loadAsync: vi.fn().mockResolvedValue({ scene: {} }),
      };
    }),
  };
});

vi.mock('three/examples/jsm/loaders/OBJLoader.js', () => {
  return {
    OBJLoader: vi.fn().mockImplementation(function OBJLoaderMock() {
      return {
        loadAsync: vi.fn().mockResolvedValue({ traverse: vi.fn() }),
      };
    }),
  };
});

vi.mock('three/examples/jsm/loaders/STLLoader.js', () => {
  return {
    STLLoader: vi.fn().mockImplementation(function STLLoaderMock() {
      return {
        loadAsync: vi.fn().mockResolvedValue({ computeVertexNormals: vi.fn() }),
      };
    }),
  };
});

describe('ModelPreview 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();
    globalThis.WebGLRenderingContext = vi.fn();
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({});
    globalThis.ResizeObserver = vi.fn().mockImplementation(function ResizeObserverMock() {
      return {
        observe: resizeObserverObserve,
        disconnect: resizeObserverDisconnect,
      };
    });
  });

  it('지원하는 파일 확장자(STL)일 경우 정상적으로 랜더링되고 파일 정보가 표시되는가?', () => {
    const file = new File([''], 'test_model.stl', { type: '' });
    render(<ModelPreview file={file} />);

    expect(screen.getByTestId('model-preview')).toBeInTheDocument();
    expect(screen.getByText(/test_model.stl/)).toBeInTheDocument();
    expect(screen.getByText('STL')).toBeInTheDocument();
    expect(mockTrackballControls).toHaveBeenCalledTimes(1);
    expect(mockTrackballControls.mock.results[0].value.handleResize).toHaveBeenCalled();
    expect(mockTrackballControls.mock.results[0].value.screen).toMatchObject({
      width: 520,
      height: 360,
    });
    expect(resizeObserverObserve).toHaveBeenCalled();
  });

  it('미리보기 해제 시 컨트롤과 리사이즈 감시를 정리하는가?', () => {
    const file = new File([''], 'test_model.stl', { type: '' });
    const { unmount } = render(<ModelPreview file={file} />);
    const controls = mockTrackballControls.mock.results[0].value;

    unmount();

    expect(controls.dispose).toHaveBeenCalled();
    expect(resizeObserverDisconnect).toHaveBeenCalled();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('지원하지 않는 파일 형식일 경우 예외 메시지를 표시하는가?', () => {
    const file = new File([''], 'test_model.txt', { type: 'text/plain' });
    render(<ModelPreview file={file} />);

    expect(
      screen.getByText('STL, OBJ, GLB, GLTF 파일만 미리보기로 확인할 수 있습니다.'),
    ).toBeInTheDocument();
    expect(screen.getByText('지원하지 않는 파일 형식입니다.')).toBeInTheDocument();
  });
});
