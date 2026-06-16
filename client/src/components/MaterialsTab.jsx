import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { mockFolders, mockMaterials } from '../mock/mockData';
import { createFolder, deleteFolder } from '../services/folderService';
import { searchMaterialsByGroup, uploadMaterialApi, deleteMaterialApi, moveMaterialApi } from '../services/materialService';
import { cn } from '../lib/utils';
import {
  FolderPlus, Folder as FolderIcon, ChevronRight, Search, X, Move,
  Download, Trash2, Upload, Loader2, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmModal from './ConfirmModal';

export default function MaterialsTab({
  groupId,
  folders,
  setFolders,
  materials,
  setMaterials,
  refreshAllData,
  showToast
}) {
  const { t, isRTL } = useLanguage();

  // Local state for folder/materials navigation and interface
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [movingMaterial, setMovingMaterial] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchDebounceRef = useRef(null);

  // Upload state
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const fileInputRef = useRef(null);

  // Deletion modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    icon: null,
    type: 'indigo',
    targetId: null,
    targetPath: ''
  });

  const notify = (title, description, type = 'info') => {
    if (typeof showToast === 'function') {
      showToast(title, description, type);
    } else {
      if (type === 'error') {
        console.error(`${title}: ${description}`);
      } else {
        console.log(`${title}: ${description}`);
      }
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      notify(t('error') || 'Error', t('notAuthenticated') || 'Please sign in to create a folder.', 'error');
      return;
    }

    const trimmedFolderName = newFolderName.trim();
    if (!trimmedFolderName) {
      notify(t('error') || 'Error', t('folderNameRequired') || 'Folder name is required.', 'error');
      return;
    }

    try {
      const creatorId = auth.currentUser?.id || auth.currentUser?.uid;
      const createdFolder = await createFolder({
        groupId,
        name: trimmedFolderName,
        parentId: currentFolderId,
        creatorId,
      });

      setFolders(prev => [...prev, createdFolder]);
      setNewFolderName('');
      setShowFolderModal(false);
      notify(t('folderCreated'), t('folderCreatedSuccess'), 'success');
    } catch (error) {
      console.error("Folder creation failed:", error);
      notify(t('folderCreateFailed') || 'Folder Error', error.message || t('unknownServerError') || 'Could not create folder.', 'error');
    }
  };

  const handleFileSelection = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setNewMaterialName(file.name);
    setNewMaterialUrl('');
  };

  const handleInputFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setNewMaterialUrl('');
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterialName.trim() || !auth.currentUser) return;
    if (!selectedFile && !newMaterialUrl.trim()) return;

    setUploadingMaterial(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('file_name', newMaterialName.trim());
        formData.append('group_id', groupId);
        if (currentFolderId) {
          formData.append('folder_id', currentFolderId);
        }
        formData.append('uploader_id', auth.currentUser.uid);

        const response = await uploadMaterialApi(formData);
        const uploadedMaterial = response.material || response.data || response;
        const fallbackFileUrl = URL.createObjectURL(selectedFile);

        if (uploadedMaterial) {
          const newMaterial = {
            id: uploadedMaterial.id || 'mat_' + Math.random().toString(36).substr(2, 9),
            groupId: groupId,
            uploaderId: auth.currentUser.uid,
            fileName: uploadedMaterial.fileName || newMaterialName.trim(),
            fileUrl: uploadedMaterial.fileUrl || fallbackFileUrl,
            folderId: uploadedMaterial.folderId ?? currentFolderId,
            createdAt: uploadedMaterial.createdAt ? new Date(uploadedMaterial.createdAt) : new Date(),
            storagePath: uploadedMaterial.storagePath,
          };

          mockMaterials.push(newMaterial);
          setMaterials(prev => [...prev, newMaterial]);
        }
      } else {
        const material = {
          id: 'mat_' + Math.random().toString(36).substr(2, 9),
          groupId: groupId,
          uploaderId: auth.currentUser.uid,
          fileName: newMaterialName.trim(),
          fileUrl: newMaterialUrl.trim(),
          folderId: currentFolderId,
          createdAt: new Date(),
          localUpload: false,
        };

        mockMaterials.push(material);
        setMaterials(prev => [...prev, material]);
      }

      setNewMaterialName('');
      setNewMaterialUrl('');
      setSelectedFile(null);
      refreshAllData();
    } catch (error) {
      console.error('Upload failed:', error);
      notify(t('error') || 'Error', error.message || 'Upload failed', 'error');
    } finally {
      setUploadingMaterial(false);
    }
  };

  const handleMoveMaterial = async (materialId, folderId) => {
    try {
      await moveMaterialApi(materialId, folderId);

      // Update local state
      setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, folderId } : m));

      // Update mock data for backward compatibility / offline fallback
      const mockIdx = mockMaterials.findIndex(m => m.id === materialId);
      if (mockIdx !== -1) {
        mockMaterials[mockIdx].folderId = folderId;
      }

      notify(t('fileMovedSuccess') || 'File moved successfully', '', 'success');
    } catch (error) {
      console.error('Failed to move material:', error);
      notify(
        t('fileMoveFailed') || 'Failed to move file',
        error.message || t('unknownServerError') || 'Could not move file.',
        'error'
      );
    } finally {
      setMovingMaterial(null);
    }
  };

  const deleteMaterialLocalFallback = (id, type) => {
    if (type === 'folder') {
      const idx = mockFolders.findIndex(f => f.id === id);
      if (idx !== -1) mockFolders.splice(idx, 1);
      mockMaterials.forEach(m => {
        if (m.folderId === id) m.folderId = null;
      });
    } else {
      const idx = mockMaterials.findIndex(m => m.id === id);
      if (idx !== -1) mockMaterials.splice(idx, 1);
    }
    refreshAllData();
  };

  const deleteMaterialFromServer = async (material) => {
    try {
      await deleteMaterialApi(material.id);
      setMaterials(prev => prev.filter(m => m.id !== material.id));

      const mockIndex = mockMaterials.findIndex(m => m.id === material.id);
      if (mockIndex !== -1) mockMaterials.splice(mockIndex, 1);

      notify(t('fileDeleted') || 'File deleted', '', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      notify(
        t('error') || 'Error',
        error.message || t('deleteFailed') || 'Failed to delete file',
        'error'
      );
    }
  };

  const deleteFolderFromServer = async (folder) => {
    try {
      const response = await deleteFolder(folder.id);
      const deletedFolderIds = response.deletedFolderIds || [folder.id];
      const deletedMaterialIds = response.deletedMaterialIds || [];

      // Update local states
      setFolders(prev => prev.filter(f => !deletedFolderIds.includes(f.id)));
      setMaterials(prev => prev.filter(m => !deletedMaterialIds.includes(m.id)));

      // Update mock data for backward compatibility / offline fallback
      deletedFolderIds.forEach(id => {
        const mockIdx = mockFolders.findIndex(f => f.id === id);
        if (mockIdx !== -1) mockFolders.splice(mockIdx, 1);
      });
      deletedMaterialIds.forEach(id => {
        const mockIdx = mockMaterials.findIndex(m => m.id === id);
        if (mockIdx !== -1) mockMaterials.splice(mockIdx, 1);
      });

      // If we are currently inside one of the deleted folders, reset view to root
      if (deletedFolderIds.includes(currentFolderId)) {
        setCurrentFolderId(null);
      }

      notify(t('folderDeleted') || 'Folder deleted successfully', '', 'success');
    } catch (error) {
      console.error('Delete folder failed:', error);
      notify(
        t('error') || 'Error',
        error.message || t('folderDeleteFailed') || 'Could not delete folder.',
        'error'
      );
    }
  };

  const promptDeleteMaterial = (material) => {
    const filePath = material.storagePath || material.fileUrl || '';
    const fileMetadata = {
      file_id: material.id,
      file_path: filePath
    };

    setConfirmModal({
      isOpen: true,
      title: t('deleteConfirm') || 'Delete file',
      message: `${t('deleteConfirm')} "${material.fileName || material.id}"`,
      icon: Trash2,
      type: 'danger',
      targetId: material.id,
      targetPath: filePath,
      onConfirm: async () => {
        console.log('Deleting file', fileMetadata);
        await deleteMaterialFromServer(material);
      }
    });
  };

  const promptDeleteFolder = (folder) => {
    setConfirmModal({
      isOpen: true,
      title: t('deleteFolder') || 'Delete folder',
      message: `${t('deleteFolderWarning') || 'Are you sure you want to delete this folder? Deleting it will also delete all files and sub-folders associated with it.'} "${folder.name}"`,
      icon: Trash2,
      type: 'danger',
      targetId: folder.id,
      onConfirm: async () => {
        await deleteFolderFromServer(folder);
      }
    });
  };

  const handleDeleteMaterial = (id, type) => {
    if (type === 'folder') {
      const folder = folders.find(f => f.id === id);
      if (folder) {
        promptDeleteFolder(folder);
      }
    } else {
      const material = materials.find(m => m.id === id);
      if (material) {
        promptDeleteMaterial(material);
      } else {
        deleteMaterialLocalFallback(id, type);
      }
    }
  };

  // Search logic
  const executeSearch = async (query) => {
    if (!groupId || !query.trim()) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    setIsSearchLoading(true);
    try {
      const results = await searchMaterialsByGroup(groupId, query.trim());
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error('Search failed, falling back to local search:', error);
      const localResults = materials.filter(m =>
        m.fileName && m.fileName.toLowerCase().includes(query.trim().toLowerCase())
      );
      setSearchResults(localResults);
    } finally {
      setIsSearchLoading(false);
    }
  };

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      executeSearch(searchQuery);
    }, 400);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, groupId]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchLoading(false);
  };

  const getBreadcrumbs = () => {
    const crumbs = [];
    let current = folders.find(f => f.id === currentFolderId);
    while (current) {
      crumbs.unshift(current);
      current = current.parentId ? folders.find(f => f.id === current.parentId) : null;
    }
    return crumbs;
  };

  const currentFolders = folders.filter(f => f.parentId === currentFolderId);
  const currentMaterials = materials.filter(m => m.folderId === currentFolderId);
  const searchActive = searchQuery.trim().length > 0;
  const displayedMaterials = searchActive ? searchResults : currentMaterials;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-2 text-sm font-bold text-gray-600">
        {currentFolderId === null ? (
          <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
            {t('materials')}
          </span>
        ) : (
          <button
            onClick={() => setCurrentFolderId(null)}
            className="hover:text-indigo-600 cursor-pointer transition-colors"
          >
            {t('materials')}
          </button>
        )}

        {getBreadcrumbs().map((crumb, idx, arr) => {
          const isLast = idx === arr.length - 1;
          return (
            <React.Fragment key={crumb.id}>
              <ChevronRight size={14} className={isRTL ? "rotate-180" : ""} />
              {isLast ? (
                <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg truncate max-w-[120px] sm:max-w-[200px]" title={crumb.name}>
                  {crumb.name}
                </span>
              ) : (
                <button
                  onClick={() => setCurrentFolderId(crumb.id)}
                  className="hover:text-indigo-600 cursor-pointer transition-colors truncate max-w-[120px] sm:max-w-[200px] text-left"
                  title={crumb.name}
                >
                  {crumb.name}
                </button>
              )}
            </React.Fragment>
          );
        })}

        <button
          onClick={() => setShowFolderModal(true)}
          className="ml-auto flex items-center gap-1 text-xs px-3 py-1.5 border border-dashed border-indigo-200 text-indigo-600 rounded-lg bg-indigo-50/30 hover:bg-indigo-50 transition-all cursor-pointer"
        >
          <FolderPlus size={14} />
          <span>{t('createFolder')}</span>
        </button>
      </div>

      {/* Grid of folders and materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Left pane: Items List */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2">{t('itemsInside')}</h3>
              {searchActive && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 p-2 transition-all"
                  aria-label={t('clearSearch')}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="relative">
              <Search size={18} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={t('searchMaterials')}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
                  aria-label={t('clearSearch')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {searchActive && isSearchLoading && (
            <p className="text-sm text-gray-500 italic py-6 text-center">{t('searchingFiles')}</p>
          )}

          {searchActive && !isSearchLoading && displayedMaterials.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-gray-500">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <FileText size={24} className="text-indigo-500" />
              </div>
              <p className="font-semibold">{t('noFilesFoundInGroup')}</p>
              <p className="text-xs">{t('tryAnotherSearch')}</p>
            </div>
          )}

          {!searchActive && currentFolders.length === 0 && currentMaterials.length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-8">{t('folderEmpty')}</p>
          )}

          {!searchActive && currentFolders.map(f => (
            <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/70 transition-colors">
              <button onClick={() => setCurrentFolderId(f.id)} className="flex items-center gap-3 font-bold text-sm text-gray-700 text-left flex-1 cursor-pointer bg-transparent border-none">
                <FolderIcon size={20} className="text-amber-500 fill-amber-400" />
                <span>{f.name}</span>
              </button>
              <button onClick={() => handleDeleteMaterial(f.id, 'folder')} className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer bg-transparent border-none">
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {displayedMaterials.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 text-left">
                <FileText size={20} className="text-indigo-500" />
                <div>
                  <p className="font-bold text-sm text-gray-800">{m.fileName}</p>
                  <p className="text-[10px] text-gray-400">{format(new Date(m.createdAt), 'dd/MM/yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!searchActive && (
                  <div className="relative">
                    <button
                      onClick={() => setMovingMaterial(movingMaterial === m.id ? null : m.id)}
                      className={cn("p-1.5 rounded-lg transition-colors cursor-pointer bg-transparent border-none", movingMaterial === m.id ? "bg-indigo-50 text-indigo-600" : "text-gray-300 hover:text-indigo-600")}
                      title={t('moveToFolder')}
                    >
                      <Move size={16} />
                    </button>

                    {movingMaterial === m.id && (
                      <>
                      <div
                        className="fixed inset-0 z-20 cursor-default"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMovingMaterial(null);
                        }}
                      />
                      <div className={cn(
                        "absolute bg-white border border-gray-100 shadow-2xl rounded-2xl p-3.5 z-30 space-y-2.5 mt-2 w-52 text-left animate-in fade-in slide-in-from-top-1 duration-150",
                        isRTL ? "left-0" : "right-0"
                      )}>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1 border-b border-gray-50 pb-1.5">{t('moveToFolder') || "Move to:"}</p>

                        {m.folderId !== null && (
                          <button
                            type="button"
                            onClick={() => handleMoveMaterial(m.id, null)}
                            className="flex items-center gap-2 w-full text-left text-xs font-bold text-gray-700 hover:text-indigo-600 py-2 px-2.5 hover:bg-indigo-50/50 rounded-xl transition-all cursor-pointer bg-transparent border-none"
                          >
                            <span className="text-sm">🏠</span>
                            <span>{t('backToRoot') || "Root /"}</span>
                          </button>
                        )}

                        <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                          {folders
                            .filter(f => f.id !== m.folderId)
                            .map(f => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => handleMoveMaterial(m.id, f.id)}
                                className="flex items-center gap-2 w-full text-left text-xs font-semibold text-gray-600 hover:text-indigo-600 py-2 px-2.5 hover:bg-indigo-50/50 rounded-xl transition-all truncate cursor-pointer bg-transparent border-none"
                              >
                                <span className="text-sm">📁</span>
                                <span className="truncate">{f.name}</span>
                              </button>
                            ))}
                          {folders.filter(f => f.id !== m.folderId).length === 0 && m.folderId === null && (
                            <p className="text-[10px] text-gray-400 italic text-center py-2">No other folders</p>
                          )}
                        </div>
                      </div>
                      </>
                    )}
                  </div>
                )}
                <a href={m.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 text-gray-300 hover:text-indigo-600 transition-colors">
                  <Download size={16} />
                </a>
                <button onClick={() => promptDeleteMaterial(m)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right pane: Upload Form */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2 mb-4 flex items-center gap-2">
            <Upload size={16} className="text-indigo-600" />
            {t('uploadMaterial')}
          </h3>
          <form onSubmit={handleUploadMaterial} className="space-y-4">
            <div
              className={cn(
                "rounded-3xl border border-dashed p-5 text-center transition-all cursor-pointer",
                dragActive
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-white"
              )}
              onClick={openFilePicker}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleInputFileChange}
              />
              <p className="text-sm font-semibold text-gray-700">{selectedFile ? selectedFile.name : 'Drag & drop a file here'}</p>
              <p className="text-xs text-gray-400 mt-1">or click to browse from your computer</p>
            </div>

            {selectedFile ? (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left text-sm text-gray-700 space-y-2">
                <p className="font-bold text-gray-900">Selected file</p>
                <p className="text-gray-600 truncate">{selectedFile.name}</p>
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  className="text-indigo-600 text-xs font-bold hover:underline bg-transparent border-none"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('fileUrl')}</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={newMaterialUrl}
                  onChange={(e) => setNewMaterialUrl(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('fileName')}</label>
              <input
                type="text"
                required
                placeholder="e.g. Summary Lesson 4"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={uploadingMaterial}
              className={cn(
                "w-full py-3 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-100 text-xs cursor-pointer border-none",
                uploadingMaterial
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              {uploadingMaterial ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </span>
              ) : (
                t('share')
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Local Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-gray-100 shadow-2xl relative">
            <button onClick={() => setShowFolderModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none"><X size={18} /></button>
            <h3 className="font-black text-gray-900 text-base mb-4">{t('createFolder')}</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text" required placeholder={t('folderName')}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
              />
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-xs cursor-pointer border-none">
                {t('createFolder')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Local Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        icon={confirmModal.icon}
        type={confirmModal.type}
      />
    </div>
  );
}
