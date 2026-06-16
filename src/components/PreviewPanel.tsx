import { useState, useEffect, useRef } from "react";
import { Play, Loader2, ExternalLink, RefreshCw, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, PREVIEW_URL_KEY } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import { RuntimeErrorAlert, RuntimeError } from "@/components/RuntimeErrorAlert";

interface PreviewPanelProps {
  projectId: string;
  runtimeError: RuntimeError | null;
  onDismiss: () => void;
  onFix: (error: RuntimeError) => void;
}

export function PreviewPanel({ projectId, runtimeError, onDismiss, onFix }: PreviewPanelProps) {
  const previewUrlKey = `${PREVIEW_URL_KEY}_${projectId}`;

  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    return localStorage.getItem(previewUrlKey);
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update previewUrl when projectId changes
  useEffect(() => {
    setPreviewUrl(localStorage.getItem(previewUrlKey));
  }, [previewUrlKey]);

  // Store previewUrl in localStorage when it changes
  useEffect(() => {
    if (previewUrl) {
      localStorage.setItem(previewUrlKey, previewUrl);
    } else {
      localStorage.removeItem(previewUrlKey);
    }
  }, [previewUrl, previewUrlKey]);

  // Poll the iframe content every 10 seconds to check if the placeholder text is gone
  useEffect(() => {
    if (!previewUrl || isPreviewReady) return;

    const intervalId = setInterval(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        const bodyText = doc.body?.innerText || "";

        // If the placeholder text is NOT present, the server is ready
        if (!bodyText.includes("Preview server unavailable") && !bodyText.includes("starting...")) {
          setIsPreviewReady(true);
        }
      } catch (e) {
        // Cross-origin error means the Vite dev server has taken over (it sets different headers).
        // That means the real app is loaded — the server is ready.
        setIsPreviewReady(true);
      }
    }, 10000);

    // Also do an immediate check after the iframe first loads
    const handleLoad = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        const bodyText = doc.body?.innerText || "";
        if (!bodyText.includes("Preview server unavailable") && !bodyText.includes("starting...")) {
          setIsPreviewReady(true);
        }
      } catch (e) {
        // Cross-origin = real app loaded
        setIsPreviewReady(true);
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", handleLoad);
    }

    return () => {
      clearInterval(intervalId);
      if (iframe) {
        iframe.removeEventListener("load", handleLoad);
      }
    };
  }, [previewUrl, isPreviewReady]);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setIsPreviewReady(false);

    try {
      const response = await api.deploy(projectId);
      setPreviewUrl(response.previewUrl);
      toast({
        title: "Deployment successful",
        description: "Your preview is now ready",
      });
    } catch (error) {
      toast({
        title: "Deployment failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* URL Bar */}
      <div className="h-12 shrink-0 flex items-center gap-2 px-3 border-b border-border/50 bg-panel z-20">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={!previewUrl || !isPreviewReady}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 flex items-center h-8 px-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
          <Globe className="w-3.5 h-3.5 mr-2 shrink-0" />
          <span className="truncate">
            {previewUrl || "Click 'Run Preview' to deploy"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {previewUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(previewUrl, "_blank")}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            onClick={handleDeploy}
            disabled={isDeploying}
            size="sm"
            className="h-7 px-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Deploying
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1.5" />
                Run Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden">
        {/* Glass Loading Screen - shown while preview is not ready */}
        {previewUrl && !isPreviewReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] z-10">
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl">
              <Loader2 className="w-8 h-8 text-white/70 animate-spin mb-4" />
              <h3 className="text-sm font-medium text-white/80 mb-1 font-serif tracking-wide">
                Preparing Environment
              </h3>
              <p className="text-xs text-white/40">
                Starting development server...
              </p>
            </div>
          </div>
        )}

        {previewUrl ? (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className={`w-full h-full border-0 transition-opacity duration-500 ${!isPreviewReady ? 'opacity-0' : 'opacity-100'}`}
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <Globe className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-sm text-white/40 font-serif tracking-wide">
              No preview available yet
            </p>
          </div>
        )}
      </div>

      {/* Error Alert Overlay - Inside the Preview Panel */}
      <RuntimeErrorAlert
        error={runtimeError}
        onDismiss={onDismiss}
        onFix={onFix}
      />
    </div>
  );
}
