import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, Trash2 } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive.js";
import { cn } from "@/lib/utils";

const PAGE_SIZE_DESKTOP = 6;
const PAGE_SIZE_MOBILE = 4;

export const TeamUnitDrawer = ({
  open,
  unit,
  onClose,
  onAddMemberClick,
  onRemoveMember,
  loadingState,
}) => {
  const { isMobile } = useResponsive();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const isLoadingMembers = loadingState === "loading";

  useEffect(() => {
    setCurrentPage(1);
    setSearch("");
  }, [unit?.id, open]);

  const filteredMembers = useMemo(() => {
    if (!unit?.members) return [];
    if (!search) return unit.members;
    return unit.members.filter((member) => {
      const haystack = `${member.name} ${member.email}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [unit?.members, search]);

  const pageSize = isMobile ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP;
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRemove = (member) => {
    if (!unit) return;
    onRemoveMember?.(unit.id, member.id);
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose?.()}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 border-l border-border bg-background p-0 sm:max-w-[480px]"
      >
        {unit ? (
          <>
            <div className="border-b border-border px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Team Unit</p>
              <h2 className="text-lg font-semibold text-foreground">{unit.name}</h2>
            </div>
            <div className="space-y-4 border-b border-border px-5 py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setSearch(event.target.value);
                  }}
                  className="pl-9"
                />
              </div>
              <Button
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onAddMemberClick}
              >
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </div>
            <ScrollArea className="flex-1 px-5 py-4">
              <div className="flex items-center justify-between pb-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Members</p>
                <Badge variant="outline" className="rounded-full">
                  {unit.members?.length || 0} total
                </Badge>
              </div>
              {isLoadingMembers ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-12 w-full animate-pulse rounded-xl bg-muted/40" />
                  ))}
                </div>
              ) : paginatedMembers.length === 0 ? (
                isMobile ? (
                  <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center text-sm text-muted-foreground">
                    <p>No members yet</p>
                    <p className="text-xs">Use “Add Member” to invite someone.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="w-[90px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center text-sm text-muted-foreground">
                            No members yet. Use “Add Member” to invite someone.
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )
              ) : isMobile ? (
                <div className="space-y-3">
                  {paginatedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {member.avatar ? <AvatarImage src={member.avatar} alt={member.name} /> : null}
                          <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary"
                        onClick={() => handleRemove(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="w-[90px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                {member.avatar ? <AvatarImage src={member.avatar} alt={member.name} /> : null}
                                <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-foreground">{member.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{member.email}</span>
                          </TableCell>
                          <TableCell className="w-[90px] text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-primary hover:text-primary"
                              onClick={() => handleRemove(member)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ScrollArea>
            {filteredMembers.length > pageSize ? (
              <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
            Select a unit to view members.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TeamUnitDrawer;


