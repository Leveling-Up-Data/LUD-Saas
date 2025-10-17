import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Eye, EyeOff, Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import { pb, UserTokenRecord } from "@/lib/pocketbase";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TokenCardProps {
  token: UserTokenRecord;
  onEdit: (token: UserTokenRecord) => void;
  onDelete: (tokenId: string) => void;
}

function TokenCard({ token, onEdit, onDelete }: TokenCardProps) {
  const [showToken, setShowToken] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(token.token_name || 'default');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Token copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy token",
        variant: "destructive",
      });
    }
  };

  const updateTokenMutation = useMutation({
    mutationFn: async (newName: string) => {
      return await pb.updateUserToken(token.id, { token_name: newName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tokens"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Token name updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update token name",
        variant: "destructive",
      });
    },
  });

  const deleteTokenMutation = useMutation({
    mutationFn: async () => {
      return await pb.deleteUserToken(token.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tokens"] });
      toast({
        title: "Success",
        description: "Token deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete token",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (editName.trim() && editName !== token.token_name) {
      updateTokenMutation.mutate(editName.trim());
    } else {
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this token? This action cannot be undone.')) {
      deleteTokenMutation.mutate();
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <div className="flex items-center space-x-2 flex-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                disabled={updateTokenMutation.isPending}
                className="h-8 w-8 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setEditName(token.token_name || 'default');
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <CardTitle className="text-lg">{token.token_name || 'default'}</CardTitle>
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={deleteTokenMutation.isPending}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`token-${token.id}`}>API Token</Label>
            <div className="relative">
              <Input
                id={`token-${token.id}`}
                type={showToken ? "text" : "password"}
                value={token.token_id}
                readOnly
                className="bg-muted pr-20 font-mono text-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToken(!showToken)}
                  className="h-6 w-6 p-0"
                >
                  {showToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(token.token_id)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Created: {new Date(token.created || '').toLocaleDateString()}</span>
            <Badge variant="secondary">Active</Badge>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Usage:</strong> Include this token in the Authorization header:
              <br />
              <code className="bg-background px-2 py-1 rounded text-xs font-mono">
                Authorization: Bearer {token.token_id.substring(0, 20)}...
              </code>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApiTokenDialog({ open, onOpenChange }: ApiTokenDialogProps) {
  const [showNewTokenForm, setShowNewTokenForm] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const { toast } = useToast();

  const { data: tokens, isLoading, error } = useQuery({
    queryKey: ["user-tokens"],
    enabled: open && pb.authStore.isValid,
    queryFn: async () => {
      return await pb.listUserTokens();
    },
  });

  const createTokenMutation = useMutation({
    mutationFn: async (tokenName: string) => {
      return await pb.createUserToken({ tokenName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tokens"] });
      setNewTokenName('');
      setShowNewTokenForm(false);
      toast({
        title: "Success",
        description: "New API token created",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create new token",
        variant: "destructive",
      });
    },
  });

  const queryClient = useQueryClient();

  const handleCreateToken = () => {
    if (newTokenName.trim()) {
      createTokenMutation.mutate(newTokenName.trim());
    }
  };

  const handleEditToken = (token: UserTokenRecord) => {
    // Edit functionality is handled within the TokenCard component
  };

  const handleDeleteToken = (tokenId: string) => {
    // Delete functionality is handled within the TokenCard component
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>API Keys</DialogTitle>
          <DialogDescription>
            Manage your API tokens for authenticating requests to our services.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create New Token */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your API Tokens</h3>
            <Button
              onClick={() => setShowNewTokenForm(true)}
              className="flex items-center space-x-2"
              disabled={showNewTokenForm}
            >
              <Plus className="h-4 w-4" />
              <span>New Token</span>
            </Button>
          </div>

          {showNewTokenForm && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-base">Create New API Token</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-token-name">Token Name</Label>
                    <Input
                      id="new-token-name"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      placeholder="e.g., Production API, Development"
                      className="font-mono"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleCreateToken}
                      disabled={!newTokenName.trim() || createTokenMutation.isPending}
                    >
                      {createTokenMutation.isPending ? "Creating..." : "Create Token"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewTokenForm(false);
                        setNewTokenName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tokens List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 bg-muted rounded mb-3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="p-6">
                <p className="text-destructive">Failed to load tokens. Please try again.</p>
              </CardContent>
            </Card>
          ) : tokens && tokens.length > 0 ? (
            <div className="space-y-4">
              {tokens.map((token) => (
                <TokenCard
                  key={token.id}
                  token={token}
                  onEdit={handleEditToken}
                  onDelete={handleDeleteToken}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No API tokens found.</p>
                <Button onClick={() => setShowNewTokenForm(true)}>
                  Create Your First Token
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
