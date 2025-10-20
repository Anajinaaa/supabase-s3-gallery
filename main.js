// src/main.js

import { supabase } from './supabase-browser-client.js';

// --- Global State & Constants ---
let selectedBucket = null;
let filesToUpload = [];
const VERIFICATION_URL = 'https://supabase.com/dashboard/project/jxrhrgkrgvwcjbjeekhx/storage/buckets/';

// --- Element References ---
const DOMElements = {
    // Create Bucket
    bucketNameInput: document.getElementById('bucketNameInput'),
    createBucketBtn: document.getElementById('createBucketBtn'),
    createBucketStatus: document.getElementById('createBucketStatus'),

    // Upload & Select
    bucketSelect: document.getElementById('bucketSelect'),
    loadGalleryBtn: document.getElementById('loadGalleryBtn'),
    dropZone: document.getElementById('dropZone'),
    filePicker: document.getElementById('filePicker'),
    uploadBtn: document.getElementById('uploadBtn'),
    uploadStatus: document.getElementById('uploadStatus'),
    postUploadLinks: document.getElementById('postUploadLinks'),

    // Gallery & Lightbox
    galleryTitle: document.getElementById('galleryTitle'),
    imageGallery: document.getElementById('imageGallery'),
    lightbox: document.getElementById('lightbox'),
    lightboxImage: document.getElementById('lightboxImage'),
    lightboxCaption: document.getElementById('lightboxCaption'),
    closeBtn: document.querySelector('.close-btn'),
};

// --- Initialization Logic ---

// 2. Initialization Logic: Populate the dropdown list on load.
async function populateBucketDropdown() {
    const { data, error } = await supabase.storage.listBuckets();
    
    // Clear existing options, keeping the initial "-- Select a Bucket --" option
    DOMElements.bucketSelect.innerHTML = '<option value="">-- Select a Bucket --</option>';

    if (error) {
        console.error("Error listing buckets:", error);
        DOMElements.createBucketStatus.innerHTML = `<span style="color:red;">Error loading buckets: ${error.message}</span>`;
        return;
    }

    if (data) {
        data.forEach(bucket => {
            const option = document.createElement('option');
            option.value = bucket.id;
            option.textContent = bucket.id;
            DOMElements.bucketSelect.appendChild(option);
        });
        // Clear status message after successful load
        DOMElements.createBucketStatus.innerHTML = '';
    }
}

// --- Bucket Creation Logic (Task 1) ---
function setupCreateBucket() {
    DOMElements.createBucketBtn.addEventListener('click', async () => {
        DOMElements.createBucketStatus.innerHTML = 'Creating bucket...';
        DOMElements.createBucketStatus.style.color = 'gray';

        const bucketName = DOMElements.bucketNameInput.value.trim().toLowerCase();

        if (!bucketName) {
            DOMElements.createBucketStatus.innerHTML = '<span style="color:orange;">Please enter a valid bucket name.</span>';
            return;
        }

        const { error } = await supabase.storage.createBucket(bucketName, {
            public: true,
        });

        if (error) {
            if (error.message.includes('already exists')) {
                DOMElements.createBucketStatus.innerHTML = `<span style="color:orange;">Bucket "${bucketName}" already exists.</span>`;
            } else {
                console.error("Supabase Error:", error);
                DOMElements.createBucketStatus.innerHTML = `<span style="color:red;">Error creating bucket: ${error.message}</span>`;
            }
        } else {
            // Success: Update dropdown, show message, and clear input
            await populateBucketDropdown();
            DOMElements.createBucketStatus.innerHTML = `
                <span style="color:green; font-weight: bold;">✅ Bucket "${bucketName}" created successfully!</span><br>
                <a href="${VERIFICATION_URL}" class="studio-link" target="_blank">Verify in Supabase Studio</a>
            `;
            DOMElements.bucketNameInput.value = '';
            // Automatically select the new bucket
            DOMElements.bucketSelect.value = bucketName;
            selectedBucket = bucketName;
        }
    });
}

// --- Upload Logic (Task 2: Upload) ---
function setupUpload() {
    // Event listeners for file selection and drag/drop
    DOMElements.dropZone.addEventListener('click', () => DOMElements.filePicker.click());
    DOMElements.filePicker.addEventListener('change', (e) => handleFileSelection(e.target.files));
    DOMElements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        DOMElements.dropZone.classList.add('drag-over');
    });
    DOMElements.dropZone.addEventListener('dragleave', () => {
        DOMElements.dropZone.classList.remove('drag-over');
    });
    DOMElements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        DOMElements.dropZone.classList.remove('drag-over');
        handleFileSelection(e.dataTransfer.files);
    });

    // Update global state and UI when files are selected
    function handleFileSelection(files) {
        filesToUpload = Array.from(files).filter(file => file.type.startsWith('image/'));
        DOMElements.uploadStatus.innerHTML = filesToUpload.length > 0
            ? `<span style="color:cyan;">${filesToUpload.length} image(s) ready to upload.</span>`
            : '<span style="color:orange;">No images selected.</span>';
    }

    // Batch Upload Function
    DOMElements.uploadBtn.addEventListener('click', async () => {
        if (!selectedBucket) {
            DOMElements.uploadStatus.innerHTML = '<span style="color:orange;">Please select a bucket first.</span>';
            return;
        }
        if (filesToUpload.length === 0) {
            DOMElements.uploadStatus.innerHTML = '<span style="color:orange;">No files to upload.</span>';
            return;
        }

        DOMElements.uploadStatus.innerHTML = `Uploading ${filesToUpload.length} files...`;
        DOMElements.uploadStatus.style.color = 'gray';

        let uploadCount = 0;
        let errors = [];

        for (const file of filesToUpload) {
            const filePath = `${file.name}`; // Store at the root of the bucket
            
            const { error } = await supabase.storage
                .from(selectedBucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true // Overwrite if file exists
                });

            if (error) {
                errors.push(file.name);
            } else {
                uploadCount++;
            }
        }

        filesToUpload = []; // Clear queue after upload attempt
        DOMElements.uploadStatus.innerHTML = '';
        
        if (errors.length > 0) {
            DOMElements.uploadStatus.innerHTML = `<span style="color:red;">Failed to upload ${errors.length} files. See console for details.</span>`;
            console.error("Upload Errors for files:", errors);
        }
        
        if (uploadCount > 0) {
            DOMElements.uploadStatus.innerHTML = `<span style="color:green;">✅ Successfully uploaded ${uploadCount} image(s)!</span>`;
            
            // 5. Success: Include link to bucket view in Supabase Studio
            DOMElements.postUploadLinks.innerHTML = `<a href="${VERIFICATION_URL}/${selectedBucket}" class="studio-link" target="_blank">View bucket in Supabase Studio</a>`;
            
            // After successful upload, refresh the gallery
            await loadGallery(); 
        }
    });
}

// --- Gallery Logic (Task 2: Gallery) ---

async function loadGallery() {
    if (!selectedBucket) {
        DOMElements.imageGallery.innerHTML = '<div class="placeholder-message">Please select a bucket to load the gallery.</div>';
        return;
    }

    DOMElements.galleryTitle.textContent = `Gallery: ${selectedBucket}`;
    DOMElements.imageGallery.innerHTML = '<div class="placeholder-message">Loading images...</div>';

    // List all files in the selected bucket
    const { data: files, error } = await supabase.storage
        .from(selectedBucket)
        .list('', { 
            limit: 100, // Max 100 files
            sortBy: { column: 'name', order: 'asc' } 
        });

    if (error) {
        DOMElements.imageGallery.innerHTML = `<div class="placeholder-message" style="color:red;">Error listing files: ${error.message}</div>`;
        return;
    }

    if (files.length === 0 || (files.length === 1 && files[0].name === '.emptyFolderPlaceholder')) {
        DOMElements.imageGallery.innerHTML = '<div class="placeholder-message">This bucket is empty. Upload some images!</div>';
        return;
    }
    
    // Filter out the placeholder file if it exists
    const validFiles = files.filter(file => file.name !== '.emptyFolderPlaceholder');
    
    DOMElements.imageGallery.innerHTML = ''; // Clear 'Loading' message

    validFiles.forEach(file => {
        // Generate the public URL for the file
        const publicUrlData = supabase.storage
            .from(selectedBucket)
            .getPublicUrl(file.name);
            
        const imageUrl = publicUrlData.data.publicUrl;
        const itemName = file.name;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'gallery-item';
        itemDiv.dataset.url = imageUrl;
        itemDiv.dataset.caption = itemName;
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = itemName;

        itemDiv.appendChild(img);
        DOMElements.imageGallery.appendChild(itemDiv);
    });
}

function setupGallery() {
    // 5. Gallery Load Logic: Event listener for the Load Gallery button
    DOMElements.loadGalleryBtn.addEventListener('click', loadGallery);
    
    // Update selected bucket on dropdown change
    DOMElements.bucketSelect.addEventListener('change', (e) => {
        selectedBucket = e.target.value;
        DOMElements.postUploadLinks.innerHTML = '';
        DOMElements.imageGallery.innerHTML = '<div class="placeholder-message">Click "Load Gallery" to view images.</div>';
    });

    // 6. Lightbox Logic: Event delegation for opening the lightbox
    DOMElements.imageGallery.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (item) {
            DOMElements.lightboxImage.src = item.dataset.url;
            DOMElements.lightboxCaption.textContent = item.dataset.caption;
            DOMElements.lightbox.style.display = 'block';
        }
    });

    // Lightbox close button
    DOMElements.closeBtn.addEventListener('click', () => {
        DOMElements.lightbox.style.display = 'none';
    });
    
    // Close lightbox when clicking outside the content
    DOMElements.lightbox.addEventListener('click', (e) => {
        if (e.target === DOMElements.lightbox) {
            DOMElements.lightbox.style.display = 'none';
        }
    });
}


// --- Main Application Start ---
document.addEventListener('DOMContentLoaded', async () => {
    // Set up all interactive parts
    setupCreateBucket();
    setupUpload();
    setupGallery();
    
    // 2. Initialization Logic: Run once on load
    await populateBucketDropdown();
}); 

