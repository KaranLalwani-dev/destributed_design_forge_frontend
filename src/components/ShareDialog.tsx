import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Link as LinkIcon, Lock, Check } from "lucide-react";
import { api } from "@/lib/api";
import { ProjectMember, ProjectRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
    projectId: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ShareDialog({ projectId, trigger, open, onOpenChange }: ShareDialogProps) {
    const { toast } = useToast();
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<ProjectRole>("EDITOR");
    const [loading, setLoading] = useState(false);
    const [internalOpen, setInternalOpen] = useState(false);

    // Use controlled open state if provided, otherwise use internal state
    const isOpen = open !== undefined ? open : internalOpen;
    const handleOpenChange = (newOpen: boolean) => {
        if (onOpenChange) {
            onOpenChange(newOpen);
        } else {
            setInternalOpen(newOpen);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadMembers();
        }
    }, [isOpen, projectId]);

    const loadMembers = async () => {
        try {
            const data = await api.getProjectMembers(projectId);
            setMembers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load members", error);
            setMembers([]);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;
        setLoading(true);
        try {
            await api.inviteMember(projectId, inviteEmail, inviteRole);
            toast({ title: "Invite sent", description: `Invited ${inviteEmail} to the project.` });
            setInviteEmail("");
            loadMembers();
        } catch (error) {
            console.error(error);
            toast({ title: "Failed to invite", description: "Could not send invitation.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: number, newRole: ProjectRole) => {
        try {
            await api.updateMemberRole(projectId, userId, newRole);
            setMembers(members.map(m => m.userId === userId ? { ...m, role: newRole } : m));
            toast({ title: "Role updated" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update role.", variant: "destructive" });
        }
    };

    const handleRemoveMember = async (userId: number) => {
        try {
            await api.removeMember(projectId, userId);
            setMembers(members.filter(m => m.userId !== userId));
            toast({ title: "Member removed" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden bg-background border border-border/50 shadow-2xl">
                <div className="p-6 pb-4">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">Share project</DialogTitle>
                    </DialogHeader>

                    {/* Invite Section */}
                    <div className="space-y-3 mb-6">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Email or username"
                                className="flex-1 bg-white border-border/80 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50 shadow-sm rounded-xl"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                            />
                            <Button
                                onClick={handleInvite}
                                disabled={!inviteEmail.trim() || loading}
                                className="px-6 font-medium rounded-xl"
                            >
                                Invite
                            </Button>
                        </div>
                        <Select value={inviteRole} onValueChange={(val) => setInviteRole(val as ProjectRole)}>
                            <SelectTrigger className="w-full bg-white border-border/80 text-foreground focus:ring-primary/50 shadow-sm rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-border/80">
                                <SelectItem value="VIEWER">Can view</SelectItem>
                                <SelectItem value="EDITOR">Can edit</SelectItem>
                                <SelectItem value="OWNER">Owner</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Members List */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">People with access</h4>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {members.length === 0 && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border/40 shadow-sm">
                                    <Avatar className="h-10 w-10 ring-1 ring-border/50">
                                        <AvatarFallback className="bg-secondary text-foreground text-sm font-medium">ME</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-sm">
                                        <div className="font-medium text-foreground">You</div>
                                        <div className="text-xs text-muted-foreground">Owner</div>
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground px-2">Owner</span>
                                </div>
                            )}

                            {Array.isArray(members) && members.map(member => (
                                <div key={member.userId} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border/40 shadow-sm hover:shadow transition-all duration-200">
                                    <Avatar className="h-10 w-10 ring-1 ring-border/50">
                                        <AvatarFallback className="bg-secondary text-foreground text-sm font-medium">
                                            {member.name ? member.name.charAt(0).toUpperCase() : (member.username || "U").slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 text-sm">
                                        <div className="font-medium text-foreground truncate">{member.name || member.username}</div>
                                        <div className="text-xs text-muted-foreground truncate">{member.username}</div>
                                    </div>

                                    {member.role === 'OWNER' ? (
                                        <span className="text-xs font-medium text-muted-foreground px-2 whitespace-nowrap">Owner</span>
                                    ) : (
                                        <Select
                                            defaultValue={member.role}
                                            onValueChange={(val) => {
                                                if (val === 'REMOVE') handleRemoveMember(member.userId);
                                                else handleRoleChange(member.userId, val as ProjectRole);
                                            }}
                                        >
                                            <SelectTrigger className="h-8 w-[100px] text-xs border-border bg-white hover:bg-muted focus:ring-1 focus:ring-primary/50 shadow-sm transition-colors rounded-lg">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent align="end" className="bg-white border-border">
                                                <SelectItem value="EDITOR">Can edit</SelectItem>
                                                <SelectItem value="VIEWER">Can view</SelectItem>
                                                <SelectItem value="REMOVE" className="text-red-500 focus:text-red-600 focus:bg-red-50">Remove</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
