import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, Plus, Trash2, Key } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";

interface ApiTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token?: string;
  tokenName?: string;
}

interface TokenRecord {
  id: string;
  token_id: string;
  token_name: string;
  created: string;
}

export function ApiTokenDialog({ open, onOpenChange }: ApiTokenDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showToken, setShowToken] = useState<Record<string, boolean>>({});
  const [selectedToken, setSelectedToken] = useState<TokenRecord | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; tokenId: string | null }>({
    open: false,
    tokenId: null,
  });
  const [createDialog, setCreateDialog] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");

  // Fetch user tokens from PocketBase
  const { data: userTokens = [], isLoading } = useQuery({
    queryKey: ["user-tokens", user?.id],
    enabled: open && !!user?.id,
    queryFn: async () => {
      try {
        if (!user?.id) return [];
        const tokens = await pb.listUserTokens({ userId: user.id });
        return tokens as TokenRecord[];
      } catch (error) {
        console.error("Error fetching user tokens:", error);
        return [];
      }
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Token copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: "Copy failed",
        description: "Failed to copy token to clipboard",
        variant: "destructive",
      });
    }
  };

  const toggleTokenVisibility = (tokenId: string) => {
    setShowToken((prev) => ({
      ...prev,
      [tokenId]: !prev[tokenId],
    }));
  };

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      toast({
        title: "Token name required",
        description: "Please enter a name for your token",
        variant: "destructive",
      });
      return;
    }

    try {
      const newToken = await pb.createUserToken({
        tokenName: newTokenName.trim(),
      });
      
      toast({
        title: "Token Created",
        description: "Your new API token has been generated.",
      });

      // Select the newly created token
      setSelectedToken(newToken as TokenRecord);
      setNewTokenName("");
      setCreateDialog(false);
      
      // Refetch tokens
      await queryClient.invalidateQueries({ queryKey: ["user-tokens"] });
    } catch (error: any) {
      console.error("Error creating token:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create API token. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteToken = async () => {
    if (!deleteDialog.tokenId) return;

    try {
      await pb.deleteUserToken(deleteDialog.tokenId);
      toast({
        title: "Token Deleted",
        description: "The API token has been deleted.",
      });

      // Clear selection if deleted token was selected
      if (selectedToken?.id === deleteDialog.tokenId) {
        setSelectedToken(null);
      }

      setDeleteDialog({ open: false, tokenId: null });
      
      // Refetch tokens
      await queryClient.invalidateQueries({ queryKey: ["user-tokens"] });
    } catch (error: any) {
      console.error("Error deleting token:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete token. Please try again.",
        variant: "destructive",
      });
    }
  };

  const displayToken = (token: string, showFull: boolean) => {
    if (showFull) return token;
    if (token.length <= 20) return "•".repeat(token.length);
    return token.substring(0, 8) + "..." + token.substring(token.length - 8);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Tokens
            </DialogTitle>
            <DialogDescription>
              Manage your API tokens. Create new tokens or view existing ones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create Token Button */}
            <Button
              onClick={() => setCreateDialog(true)}
              className="w-full"
              variant="default"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Token
            </Button>

            {/* Tokens List */}
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading tokens...
              </div>
            ) : userTokens.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">No API tokens yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first API token to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {userTokens.map((token) => (
                  <Card
                    key={token.id}
                    className={`cursor-pointer transition-colors ${
                      selectedToken?.id === token.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedToken(token)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {token.token_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created {new Date(token.created).toLocaleDateString()}
                          </p>
                          {selectedToken?.id === token.id && (
                            <div className="mt-3 space-y-2">
                              <Label className="text-xs">Token Value</Label>
                              <div className="relative">
                                <Input
                                  type={showToken[token.id] ? "text" : "password"}
                                  value={token.token_id}
                                  readOnly
                                  className="bg-muted pr-20 font-mono text-xs"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTokenVisibility(token.id);
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    {showToken[token.id] ? (
                                      <EyeOff className="h-3 w-3" />
                                    ) : (
                                      <Eye className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(token.token_id);
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDialog({ open: true, tokenId: token.id });
                                }}
                                className="mt-2"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete Token
                              </Button>
                            </div>
                          )}
                        </div>
                        {selectedToken?.id !== token.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(token.token_id);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Usage Instructions */}
            {selectedToken && (
              <div className="bg-muted/50 p-3 rounded-md mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Usage:</strong> Include this token in the Authorization header:
                  <br />
                  <code className="bg-background px-2 py-1 rounded text-xs mt-1 block">
                    Authorization: Bearer {selectedToken.token_id.substring(0, 20)}...
                  </code>
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Token Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Token</DialogTitle>
            <DialogDescription>
              Enter a name for your new API token. This token will be generated securely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-token-name">Token Name</Label>
              <Input
                id="new-token-name"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                placeholder="e.g., Production Token, Development Token"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateToken();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateToken} disabled={!newTokenName.trim()}>
              Create Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, tokenId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Token?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The token will be permanently deleted and any applications using it will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteToken}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
