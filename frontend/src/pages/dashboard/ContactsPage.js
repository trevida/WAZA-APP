import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { contactService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ContactsPage = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', currentWorkspace?.id],
    queryFn: () => contactService.getAll(currentWorkspace.id),
    enabled: !!currentWorkspace,
  });

  const filteredContacts = contacts?.filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          contact.phone_number.includes(searchTerm);
    const matchesTag = !selectedTag || contact.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  }) || [];

  const allTags = [...new Set(contacts?.flatMap(c => c.tags || []) || [])];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Contacts</h1>
          <p className="text-text-secondary">Gérez votre base de contacts WhatsApp</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/contacts/import">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importer CSV
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-2xl p-4 mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                placeholder="Rechercher par nom ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedTag === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              Tous
            </Button>
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <div className="animate-pulse">Chargement...</div>
        </div>
      ) : filteredContacts.length > 0 ? (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Dernière interaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    {contact.name || 'Sans nom'}
                  </TableCell>
                  <TableCell className="font-mono text-text-muted">
                    {contact.phone_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {contact.tags?.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-text-muted text-sm">
                    {contact.last_interaction
                      ? new Date(contact.last_interaction).toLocaleDateString('fr-FR')
                      : 'Jamais'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Aucun contact</h3>
            <p className="text-text-secondary mb-6">
              {searchTerm || selectedTag
                ? 'Aucun contact ne correspond à vos filtres'
                : 'Importez vos premiers contacts pour commencer'}
            </p>
            <Link to="/dashboard/contacts/import">
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Importer des contacts
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
