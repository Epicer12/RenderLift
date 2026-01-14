import React from 'react';

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 prose dark:prose-invert">
            <h1 className="text-3xl font-bold mb-4">Terms of Service – RenderLift</h1>
            <p className="text-gray-500 mb-8">Last updated: January 14, 2026</p>

            <p className="mb-6">
                By accessing or using RenderLift, you agree to the following Terms of Service. If you do not agree with these terms, please do not use the Service.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Description of the Service</h2>
            <p className="mb-4">
                RenderLift is a free web application that helps users generate Google Colab notebooks for rendering Blender projects using their own Google Drive and Google Cloud resources.
            </p>
            <p className="mb-4">
                RenderLift does not provide rendering hardware or cloud GPU resources directly.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. User Responsibilities</h2>
            <p className="mb-4">
                You are responsible for:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
                <li>The content you upload or render</li>
                <li>Ensuring you have rights to use the files you submit</li>
                <li>Running generated Google Colab notebooks at your own discretion</li>
            </ul>
            <p className="mb-4">
                You agree not to use RenderLift for illegal, harmful, or abusive purposes.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. No Warranty</h2>
            <p className="mb-4">
                RenderLift is provided on an “as-is” and “as-available” basis. We make no guarantees regarding uptime, performance, or correctness of rendered outputs.
            </p>
            <p className="mb-4">
                Rendering results may vary based on user configuration and Google Colab availability.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Limitation of Liability</h2>
            <p className="mb-4">
                RenderLift shall not be held liable for:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Loss of data</li>
                <li>Failed renders</li>
                <li>Google account or quota limitations</li>
                <li>Any damages resulting from the use or inability to use the Service</li>
            </ul>
            <p className="mb-4">
                Use of the Service is at your own risk.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Termination</h2>
            <p className="mb-4">
                We reserve the right to suspend or terminate access to the Service at any time if misuse or abuse is detected.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Changes to These Terms</h2>
            <p className="mb-4">
                These Terms of Service may be updated at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Governing Law</h2>
            <p className="mb-4">
                These Terms shall be governed by the laws applicable in your jurisdiction.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Information</h2>
            <p className="mb-4">
                For questions regarding these Terms, please contact:
            </p>
            <p className="font-semibold">Email: hntsoftware@gmail.com</p>
        </div>
    );
}
