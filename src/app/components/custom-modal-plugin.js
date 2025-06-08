import React, { useState, useRef } from 'react';
import { PluginComponent } from 'react-markdown-editor-lite';
import styles from './custom-modal-plugin.module.css';
import Pagination from './pagination';

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
          maxWidth: '800px',
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

// Image component with delete button
const ImageItem = ({ image, selected, onSelect, onDelete }) => {
  return (
    <div 
      className={`${styles.imageItem} ${selected ? styles.selected : ''}`}
      onClick={() => onSelect(image)}
    >
      <button 
        className={styles.deleteButton}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(image);
        }}
      >
        &times;
      </button>
      <img 
        src={image.url} 
        alt={image.original_filename} 
        className={styles.thumbnail}
      />
      <div className={styles.imageInfo}>
        <span>{image.original_filename}</span>
        <span>{`${image.width}x${image.height}`}</span>
      </div>
    </div>
  );
};

// Image Gallery component
const ImageGallery = ({ images, selectedImage, onSelectImage, onDeleteImage, loading, translations }) => {
  if (loading) {
    return <div className={styles.loading}>{translations.customModalLoadingImages}</div>;
  }
  
  if (images.length === 0) {
    return <div className={styles.noImages}>{translations.customModalNoImagesUploaded}</div>;
  }
  
  return (
    <div className={styles.imageGrid}>
      {images.map(image => (
        <ImageItem 
          key={image.id} 
          image={image} 
          selected={selectedImage && selectedImage.id === image.id}
          onSelect={onSelectImage}
          onDelete={onDeleteImage}
        />
      ))}
    </div>
  );
};

// File Upload component
const FileUpload = ({ onUpload, uploading, translations }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Check if the number of files exceeds the maximum limit
      if (files.length > 5) {
        setError(translations.customModalMaxFilesError);
        // Reset the input value
        e.target.value = null;
        return;
      }
      
      setError(''); // Clear any previous errors
      onUpload(files);
      // Reset the input value so the same file can be uploaded again if needed
      e.target.value = null;
    }
  };
  
  const handleUploadClick = (e) => {
    // Prevent form submission
    e.preventDefault();
    e.stopPropagation();
    // Trigger file input click
    fileInputRef.current.click();
  };
  
  return (
    <div className={styles.fileUpload}>
      {error && <div className={styles.error}>{error}</div>}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />
      <button 
        type="button" // Explicitly set type to button to prevent form submission
        className={styles.uploadButton}
        onClick={handleUploadClick}
        disabled={uploading}
      >
        {uploading ? translations.customModalUploadingImages : translations.customModalUploadImages}
      </button>
      <div className={styles.helpText}>{translations.customModalMaxFilesPerUpload}</div>
    </div>
  );
};

// Custom plugin that shows a modal with image management
class CustomModalPlugin extends PluginComponent {
  // Define plugin name, must be unique
  static pluginName = 'custom-modal';
  // Define where to render, default is left, can also use 'right'
  static align = 'left';
  
  constructor(props) {
    super(props);
    
    this.state = {
      isModalOpen: false,
      images: [],
      selectedImage: null,
      loading: false,
      uploading: false,
      error: null,
      page: 1,
      totalPages: 1,
      translations: null
    };
    
    this.handleClick = this.handleClick.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.fetchImages = this.fetchImages.bind(this);
    this.handleImageUpload = this.handleImageUpload.bind(this);
    this.handleImageDelete = this.handleImageDelete.bind(this);
    this.handleImageSelect = this.handleImageSelect.bind(this);
    this.insertSelectedImage = this.insertSelectedImage.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
  }
  
  async fetchImages() {
    try {
      this.setState({ loading: true, error: null });
      const response = await fetch(`/api/images?page=${this.state.page}&limit=12`);
      
      if (!response.ok) {
        throw new Error(this.state.translations?.customModalFailedToFetchImages || 'Failed to fetch images');
      }
      
      const data = await response.json();
      this.setState({
        images: data.images,
        totalPages: data.totalPages,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching images:', error);
      this.setState({
        error: error.message,
        loading: false
      });
    }
  }
  
  handlePageChange(newPage) {
    this.setState({ page: newPage }, this.fetchImages);
  }
  
  async handleImageUpload(files) {
    try {
      this.setState({ uploading: true, error: null });
      
      // Check if the number of files exceeds the maximum limit
      if (files.length > 5) {
        this.setState({
          error: this.state.translations?.customModalMaxFilesError || 'You can only upload up to 5 files at once',
          uploading: false
        });
        return;
      }
      
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      
      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(this.state.translations?.customModalFailedToUploadImages || 'Failed to upload images');
      }
      
      // Refresh the image list after upload
      await this.fetchImages();
      this.setState({ uploading: false });
    } catch (error) {
      console.error('Error uploading images:', error);
      this.setState({
        error: error.message,
        uploading: false
      });
    }
  }
  
  async handleImageDelete(image) {
    const confirmMessage = this.state.translations?.customModalDeleteImageConfirm ? 
      this.state.translations.customModalDeleteImageConfirm.replace('{0}', image.original_filename) : 
      `Are you sure you want to delete ${image.original_filename}?`;
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      this.setState({ loading: true, error: null });
      
      const response = await fetch(`/api/images?id=${image.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(this.state.translations?.customModalFailedToDeleteImage || 'Failed to delete image');
      }
      
      // If the deleted image was selected, clear the selection
      if (this.state.selectedImage && this.state.selectedImage.id === image.id) {
        this.setState({ selectedImage: null });
      }
      
      // Refresh the image list after deletion
      await this.fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      this.setState({
        error: error.message,
        loading: false
      });
    }
  }
  
  handleImageSelect(image) {
    this.setState({ selectedImage: image });
  }
  
  insertSelectedImage() {
    const { selectedImage } = this.state;
    if (!selectedImage) return;
    
    // Insert HTML img tag into the editor
    const imgHtml = `<img src="${selectedImage.url}" alt="${selectedImage.original_filename}" width="${selectedImage.width}"/>`;
    this.editor.insertText(imgHtml);
    this.closeModal();
  }
  
  handleClick() {
    // Get the current locale from the URL path
    const locale = window.location.pathname.split('/')[1] || 'en';
    
    // Set modal to open first
    this.setState({ isModalOpen: true });
    
    // Then fetch translations based on locale
    if (locale === 'ja') {
      // For Japanese
      fetch('/api/translations?locale=ja')
        .then(response => response.json())
        .then(data => {
          this.setState({ translations: data }, this.fetchImages);
        })
        .catch(error => {
          console.error('Failed to load translations:', error);
          this.fetchImages();
        });
    } else {
      // For English (default)
      fetch('/api/translations?locale=en')
        .then(response => response.json())
        .then(data => {
          this.setState({ translations: data }, this.fetchImages);
        })
        .catch(error => {
          console.error('Failed to load translations:', error);
          this.fetchImages();
        });
    }
  }
  
  closeModal() {
    this.setState({ isModalOpen: false, selectedImage: null });
  }
  
  render() {
    const { isModalOpen, images, selectedImage, loading, uploading, error } = this.state;
    
    return (
      <>
        <span
          className="button button-type-modal"
          title={this.state.translations?.customModalInsertImage || "Insert Image"}
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
        
        <Modal isOpen={isModalOpen} onClose={this.closeModal}>
          {uploading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner}></div>
              <div className={styles.loadingText}>{this.state.translations?.customModalUploadingImages || "Uploading images..."}</div>
            </div>
          )}
          
          <h4>{this.state.translations?.customModalImageManager || "Image Manager"}</h4>
          
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
          
          <FileUpload 
            onUpload={this.handleImageUpload}
            uploading={uploading}
            translations={this.state.translations || {}}
          />
          
          <ImageGallery 
            images={images}
            selectedImage={selectedImage}
            onSelectImage={this.handleImageSelect}
            onDeleteImage={this.handleImageDelete}
            loading={loading}
            translations={this.state.translations || {}}
          />
          
          {!loading && images.length > 0 && (
            <Pagination
              currentPage={this.state.page}
              totalPages={this.state.totalPages}
              onPageChange={this.handlePageChange}
              className={styles.imagePagination}
            />
          )}
          
          <div className={styles.modalActions}>
            <button 
              className={styles.insertButton}
              onClick={this.insertSelectedImage}
              disabled={!selectedImage || uploading}
            >
              {this.state.translations?.customModalInsertSelectedImage || "Insert Selected Image"}
            </button>
            <button 
              className={styles.cancelButton}
              onClick={this.closeModal}
              disabled={uploading}
            >
              {this.state.translations?.customModalCancel || "Cancel"}
            </button>
          </div>
        </Modal>
      </>
    );
  }
}

export default CustomModalPlugin;
