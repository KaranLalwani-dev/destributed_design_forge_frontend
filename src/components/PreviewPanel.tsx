import { useState, useEffect } from "react";
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
  const [iframeKey, setIframeKey] = useState(0);
  const { toast } = useToast();

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

  // Poll the preview URL to check when it's fully ready
  useEffect(() => {
    if (!previewUrl) {
      setIsPreviewReady(false);
      return;
    }

    setIsPreviewReady(false);
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    const startTime = Date.now();
    const MAX_POLL_TIME = 30000; // 30 seconds max polling

    const checkReady = async () => {
      if (!isMounted) return;

      // Fallback: If we've been polling for over 30 seconds, just show the iframe
      if (Date.now() - startTime > MAX_POLL_TIME) {
        setIsPreviewReady(true);
        setIframeKey(k => k + 1);
        return;
      }

      try {
        const res = await fetch(previewUrl);
        const text = await res.text();
        
        if (text.includes("Preview server unavailable") || text.includes("starting...")) {
          // Still showing the proxy placeholder, keep polling
          timeoutId = setTimeout(checkReady, 1000);
        } else {
          // Server is returning something else (likely the actual Vite app)
          if (isMounted) {
            setIsPreviewReady(true);
            setIframeKey(k => k + 1); // remount iframe to get the fresh content
          }
        }
      } catch (e) {
        // During startup, the proxy's 502/503 page often doesn't have CORS headers,
        // causing fetch to throw a TypeError. This means the real server isn't ready yet.
        // We should keep polling until Vite starts (Vite sends CORS headers by default).
        timeoutId = setTimeout(checkReady, 1000);
      }
    };

    checkReady();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [previewUrl]);

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
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.src = iframe.src;
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
      <div className="flex-1 bg-muted relative overflow-hidden">
        {/* Glass Loading Screen */}
        {previewUrl && (!isPreviewReady || isDeploying) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-md z-10 animate-in fade-in duration-300">
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-panel/40 border border-border shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] backdrop-blur-xl">
              <Loader2 className="w-8 h-8 text-foreground animate-spin mb-4" />
              <h3 className="text-sm font-medium text-foreground mb-1 font-serif tracking-wide">
                Preparing Environment
              </h3>
              <p className="text-xs text-muted-foreground">
                Starting development server...
              </p>
            </div>
          </div>
        )}

        {previewUrl ? (
          <iframe
            key={iframeKey}
            src={previewUrl}
            className={`w-full h-full border-0 transition-opacity duration-500 ${!isPreviewReady || isDeploying ? 'opacity-0' : 'opacity-100'}`}
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
            <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mb-4 border border-border/50">
              <Globe className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground font-serif">
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
