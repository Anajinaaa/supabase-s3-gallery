# 🪣 Supabase Cloud Storage Manager: S3 Image Gallery
*(Full-Stack Development, Cloud Storage, Modular JavaScript)*

## 🔗 Live Demo & Repository
| Resource | Link |
| :--- | :--- |
| **Deployed App** | **[Live Demo URL (Cloudflare Link)]** |
| **Repository** | [https://github.com/Anajinaaa/supabase-s3-gallery](https://github.com/Anajinaaa/supabase-s3-gallery) |

## Overview
This project is a constraint-driven, full-stack application that demonstrates secure, end-to-end cloud object management using the **Supabase Storage API** (S3-compatible). It was built following **Software Engineering principles** (modularity, incremental development) to deliver full CRUD functionality for an image gallery.

### Key Technologies
- **Frontend:** Vanilla JavaScript, HTML/CSS, Vite
- **Backend/Cloud:** Supabase Storage (S3), Service Role Key Management
- **Design:** ES Module structure, CSS Grid for responsive gallery layout
- **Deployment:** Cloudflare Pages

## 🔒 Technical Constraints & Solutions

The primary goal of this assignment was adherence to strict software engineering and security constraints:

| Constraint | Solution Implemented | Skill Demonstrated |
| :--- | :--- | :--- |
| **Secure Key Handling** | Used the Service Role Key exclusively for high-privilege operations, and enforced a strict **`.gitignore`** to prevent the `.env` file from being committed to the public repository. | Security, CI/CD Best Practices |
| **Modularity & Complexity** | Implemented a **single ES Module** (`supabaseBrowserClient.js`) to manage the core Supabase connection object, avoiding redundant configuration and preparing the codebase for larger frameworks (like Next.js). | Software Architecture, Code Reusability |
| **Incremental Development** | Followed the "Descartes' Method" of *piece-by-piece* development, ensuring the **Create Bucket** module was fully functional and verified before moving to Upload/Gallery features. | Project Management, Debugging |
| **Verification & Testing** | Built a feature that displays a direct, clickable link to the **Supabase Studio** after a successful bucket creation, proving the functionality works end-to-end. | Quality Assurance, Verification |

## ⚙️ Local Setup

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Anajinaaa/supabase-s3-gallery.git](https://github.com/Anajinaaa/supabase-s3-gallery.git)
    cd supabase-s3-gallery
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure:** Create a **`.env`** file and add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_SERVICE_ROLE_KEY`.
4.  **Run:**
    ```bash
    npm run dev
    ```
