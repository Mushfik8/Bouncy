/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Download, Code, CheckCircle, FileText, Smartphone, ShieldCheck, Terminal } from 'lucide-react';
import { ANDROID_FILES, generateAndroidProjectZip } from '../android/exportProject';

interface AndroidExportModalProps {
  onClose: () => void;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({ onClose }) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'guide'>('files');

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateAndroidProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bouncy-pocket-quest-android-studio-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate zip:', err);
      alert('Error generating Android project ZIP.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedFile = ANDROID_FILES[selectedFileIdx] || ANDROID_FILES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:px-6 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base md:text-lg font-bold text-white tracking-wide">
                  Native Android Project Exporter
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Target: API 36 (Android 16)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Package: <code className="text-amber-300 font-mono">com.mushfik8.bouncypocketquest</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <span>Packing ZIP...</span>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-200" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Android Project (.ZIP)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center px-4 md:px-6 pt-3 border-b border-slate-800 bg-slate-950/20 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'files'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Source Code & Gradle Files ({ANDROID_FILES.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Play Store & Release Guide</span>
          </button>
        </div>

        {/* Content area */}
        {activeTab === 'files' ? (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* File list sidebar */}
            <div className="w-64 border-r border-slate-800 bg-slate-950/40 p-2 overflow-y-auto shrink-0 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1">Project Files</span>
              {ANDROID_FILES.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs truncate transition-colors cursor-pointer flex items-center gap-2 ${
                    selectedFileIdx === idx
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{file.path}</span>
                </button>
              ))}
            </div>

            {/* Code viewer */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/80 p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs text-slate-400 font-mono">
                <span>{selectedFile.path}</span>
                <span>{selectedFile.content.split('\n').length} lines</span>
              </div>
              <pre className="flex-1 overflow-auto p-3 rounded-lg bg-slate-900/90 text-slate-200 text-xs font-mono leading-relaxed select-text">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                1. How to Build in Android Studio
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed">
                <li>Download the zip archive using the green button above and extract it into a directory.</li>
                <li>Launch Android Studio (Ladybug 2024.2+ or later) and choose <strong>File → Open</strong>.</li>
                <li>Select the extracted folder containing <code>settings.gradle.kts</code>.</li>
                <li>Let Gradle sync dependencies (Jetpack Compose, Kotlin 2.1, Core-KTX).</li>
                <li>Connect an Android phone or launch an emulator (API 26 to 36) and click <strong>Run ▶</strong>.</li>
              </ol>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                2. Generating a Signed Android App Bundle (AAB) for Google Play
              </h3>
              <p className="text-slate-400 leading-relaxed mb-2">
                Under the Google Play submission requirements effective for 2026, new submissions must target Android 16 (API level 36) and provide an <code>.aab</code> bundle:
              </p>
              <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-emerald-300 mb-2">
                ./gradlew bundleRelease
              </div>
              <p className="text-slate-400 leading-relaxed">
                Or in Android Studio: <strong>Build → Generate Signed Bundle / APK → Android App Bundle</strong>. Create or select your upload keystore, enter key alias and passwords, and select the <code>release</code> build variant.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                3. Play Console Checklist
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-400 leading-relaxed">
                <li><strong>Target SDK</strong>: Already configured to API 36 in <code>app/build.gradle.kts</code>.</li>
                <li><strong>Package ID</strong>: Configured as <code>com.mushfik8.bouncypocketquest</code>.</li>
                <li><strong>Privacy Policy & Permissions</strong>: The game requires zero sensitive permissions (no camera, no location, no contacts). Offline gameplay only with local storage.</li>
                <li><strong>Content Rating Questionnaire</strong>: Safe for Everyone (ESRB E / PEGI 3) — no violence, no gambling, no user interactions.</li>
                <li><strong>Release Track</strong>: Upload the <code>app-release.aab</code> to Closed Testing or Production track on the Google Play Console.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
