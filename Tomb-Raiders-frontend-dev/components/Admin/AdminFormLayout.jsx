import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

function AdminFormShell({ title, description, countLabel, children }) {
  return (
    <section
      className="w-full bg-white border border-[#EEE] shadow-sm mb-[3vw]"
      style={{ borderRadius: vw(10), padding: vw(24) }}
    >
      <div className="flex justify-between items-start" style={{ marginBottom: vw(24) }}>
        <div>
          <h2 className="font-bold text-[#1A1A1A] m-0" style={{ fontSize: vw(18) }}>
            {title}
          </h2>
          <p className="text-[#777] m-0" style={{ fontSize: vw(13), marginTop: vw(8) }}>
            {description}
          </p>
        </div>
        <span
          className="bg-[#EAF6EF] text-[#2C9753] font-bold"
          style={{ fontSize: vw(12), padding: `${vw(6)} ${vw(12)}`, borderRadius: vw(4) }}
        >
          {countLabel}
        </span>
      </div>
      {children}
    </section>
  );
}

function AdminFormListPanel({
  title,
  loadingMessage,
  emptyMessage,
  isEmpty,
  isLoading,
  errorMessage,
  isSubmitting,
  onRefresh,
  children,
}) {
  return (
    <div
      className="border border-[#EEE] bg-[#FAFAFA]"
      style={{ borderRadius: vw(6), padding: vw(18), marginBottom: vw(24) }}
    >
      <div className="flex justify-between items-center" style={{ marginBottom: vw(14) }}>
        <h3 className="font-bold text-[#1A1A1A] m-0" style={{ fontSize: vw(15) }}>
          {title}
        </h3>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading || isSubmitting}
          className="bg-white text-[#2C9753] font-bold cursor-pointer border border-[#2C9753] hover:bg-[#F1FAF4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: vw(12), padding: `${vw(7)} ${vw(12)}`, borderRadius: vw(4) }}
        >
          새로고침
        </button>
      </div>

      {isLoading && (
        <div className="text-[#777]" style={{ fontSize: vw(13) }}>
          {loadingMessage}
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="text-[#D9534F]" style={{ fontSize: vw(13) }}>
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && isEmpty && (
        <div className="text-[#777]" style={{ fontSize: vw(13) }}>
          {emptyMessage}
        </div>
      )}

      {!isLoading && !errorMessage && !isEmpty && children}
    </div>
  );
}

function AdminFormActions({
  submitButtonText,
  cancelButtonText,
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  return (
    <div className="flex justify-center items-center" style={{ gap: vw(16), marginTop: vw(32) }}>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="bg-[#2C9753] text-white font-bold cursor-pointer border-none shadow-md hover:bg-[#257F46] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontSize: vw(15), padding: `${vw(11)} ${vw(46)}`, borderRadius: vw(4) }}
      >
        {submitButtonText}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="bg-white text-[#555] font-bold cursor-pointer border border-[#DDD] shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontSize: vw(15), padding: `${vw(11)} ${vw(46)}`, borderRadius: vw(4) }}
      >
        {cancelButtonText}
      </button>
    </div>
  );
}

function AdminInlineActionButton({ variant, onClick, disabled, children }) {
  const isDanger = variant === 'danger';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`bg-white ${
        isDanger
          ? 'text-[#D9534F] border-[#F1C5C3] hover:bg-[#FFF5F5]'
          : 'text-[#2C9753] border-[#2C9753] hover:bg-[#F1FAF4]'
      } font-bold cursor-pointer border transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
      style={{ fontSize: vw(12), padding: `${vw(7)} ${vw(12)}`, borderRadius: vw(4) }}
    >
      {children}
    </button>
  );
}

function AdminField({ label, children }) {
  return (
    <label className="flex flex-col font-bold text-[#333] text-left" style={{ fontSize: vw(14) }}>
      {label}
      {children}
    </label>
  );
}

function AdminTextInput({ as: Component = 'input', style = {}, ...props }) {
  return (
    <Component
      className="border border-[#DDD] outline-none transition-colors focus:border-[#2C9753] font-normal"
      style={{
        marginTop: vw(8),
        padding: vw(12),
        fontSize: vw(14),
        borderRadius: vw(4),
        ...style,
      }}
      {...props}
    />
  );
}

function AdminTruncatedText({ className, style, children }) {
  return (
    <div
      className={className}
      style={{
        fontSize: vw(12),
        marginTop: vw(6),
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

AdminFormShell.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  countLabel: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

AdminFormListPanel.propTypes = {
  title: PropTypes.string.isRequired,
  loadingMessage: PropTypes.string.isRequired,
  emptyMessage: PropTypes.string.isRequired,
  isEmpty: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  children: PropTypes.node,
};

AdminFormListPanel.defaultProps = {
  children: null,
};

AdminFormActions.propTypes = {
  submitButtonText: PropTypes.string.isRequired,
  cancelButtonText: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

AdminInlineActionButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'danger']),
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

AdminInlineActionButton.defaultProps = {
  variant: 'primary',
};

AdminField.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

AdminTextInput.propTypes = {
  as: PropTypes.elementType,
  style: PropTypes.object,
};

AdminTextInput.defaultProps = {
  as: 'input',
  style: {},
};

AdminTruncatedText.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node.isRequired,
};

AdminTruncatedText.defaultProps = {
  className: 'text-[#666]',
  style: {},
};

export {
  AdminField,
  AdminFormActions,
  AdminFormListPanel,
  AdminFormShell,
  AdminInlineActionButton,
  AdminTextInput,
  AdminTruncatedText,
};
