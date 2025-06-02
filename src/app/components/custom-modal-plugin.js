import React, { useState } from 'react';
import { PluginComponent } from 'react-markdown-editor-lite';

// Modal component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '5px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Custom plugin that shows a modal
class CustomModalPlugin extends PluginComponent {
  // Define plugin name, must be unique
  static pluginName = 'custom-modal';
  // Define where to render, default is left, can also use 'right'
  static align = 'left';
  
  constructor(props) {
    super(props);
    
    this.state = {
      isModalOpen: false
    };
    
    this.handleClick = this.handleClick.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
  
  handleClick() {
    this.setState({ isModalOpen: true });
  }
  
  closeModal() {
    this.setState({ isModalOpen: false });
  }
  
  render() {
    return (
      <>
        <span
          className="button button-type-modal"
          title="Open Modal"
          onClick={this.handleClick}
          style={{ cursor: 'pointer' }}
        >
          <svg viewBox="0 0 16 16" height="16" width="16" style={{ marginRight: '5px', marginTop: '6px' }}>
            <path 
              fill="currentColor" 
              d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"
            />
            <path 
              fill="currentColor" 
              d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"
            />
          </svg>
        </span>
        
        <Modal isOpen={this.state.isModalOpen} onClose={this.closeModal}>
          <h2>Custom Modal</h2>
          <p>This is a custom modal that can be used to add content, links, or any other functionality you need.</p>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => {
                // Example: Insert text into the editor
                this.editor.insertText('**Custom text from modal**');
                  this.closeModal();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Insert Sample Text
            </button>
            <button 
              onClick={this.closeModal}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e0e0e0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </Modal>
      </>
    );
  }
}

export default CustomModalPlugin;
