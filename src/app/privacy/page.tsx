import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 prose dark:prose-invert">
            <h1 className="text-3xl font-bold mb-4">Privacy Policy – RenderLift</h1>
            <p className="text-gray-500 mb-8">Last updated: January 16 2026</p>

            <p className="mb-6">
                RenderLift ("we", "our", or "the Service") is a web application that helps users render Blender projects using their own Google resources. This Privacy Policy explains how information is collected, used, and protected when you use RenderLift.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            <p className="mb-4">
                When you sign in using your Google account, we collect basic profile information such as your name and email address for authentication purposes.
            </p>
            <p className="mb-4">
                With your explicit consent, RenderLift accesses your Google Drive to upload and manage Blender files that you choose to render. RenderLift only accesses files that are created or selected by the user through the application.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of Google Drive Data</h2>
            <p className="mb-4">
                RenderLift uses the Google Drive API with the <code>drive.file</code> permission scope. This means:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
                <li>RenderLift can only access files that you explicitly upload or create using the app</li>
                <li>Files are stored in <strong>your own Google Drive</strong></li>
                <li>RenderLift does <strong>not</strong> scan, read, or access other files in your Drive</li>
                <li>RenderLift does <strong>not</strong> store your Drive files on its own servers</li>
            </ul>
            <p className="mb-4">
                Google Drive data is used solely for the purpose of enabling cloud-based rendering of Blender projects.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Storage and Security</h2>
            <p className="mb-4">
                RenderLift does not permanently store user files. Authentication tokens are handled securely and used only to perform authorized actions requested by the user.
            </p>
            <p className="mb-4">
                We do not sell, rent, or share personal data or Google Drive data with third parties.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Third-Party Services</h2>
            <p className="mb-4">
                RenderLift uses Google services including:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Google Sign-In</li>
                <li>Google Drive API</li>
                <li>Google Colab (user-initiated execution)</li>
            </ul>
            <p className="mb-4">
                Rendering is performed using the user’s own Google account and resources.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. User Control and Revoking Access</h2>
            <p className="mb-4">
                You may revoke RenderLift’s access to your Google account and Google Drive at any time through your Google Account permissions page.
            </p>
            <p className="mb-4">
                Once access is revoked, RenderLift will no longer be able to access your data.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Changes to This Policy</h2>
            <p className="mb-4">
                This Privacy Policy may be updated from time to time. Any changes will be reflected on this page with an updated revision date.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Information</h2>
            <p className="mb-4">
                If you have any questions about this Privacy Policy, you may contact:
            </p>
            <p className="font-semibold">Email: hntsoftwares@gmail.com</p>
        </div>
    );
}
