import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, FileText, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { contactService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';

const ContactsImport = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [csvData, setCsvData] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const contacts = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
          phone_number: values[0],
          name: values[1] || '',
          tags: values[2] ? values[2].split(';').map(t => t.trim()) : [],
        };
      });

      setPreview(contacts);
      
      const allContacts = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
          phone_number: values[0],
          name: values[1] || '',
          tags: values[2] ? values[2].split(';').map(t => t.trim()) : [],
        };
      });
      setCsvData(allContacts);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const response = await contactService.importBulk(currentWorkspace.id, csvData);
      setResult(response);
      queryClient.invalidateQueries(['contacts']);
      toast.success(`${response.imported} contacts importés!`);
    } catch (error) {
      toast.error('Erreur lors de l\'importation');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/contacts')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold">Importer des Contacts</h1>
            <p className="text-text-secondary">Importez vos contacts via CSV</p>
          </div>
        </div>

        {!result ? (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div className="bg-surface border-2 border-dashed border-border rounded-2xl p-12 text-center">
              <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Glissez votre fichier CSV ici</h3>
              <p className="text-text-secondary mb-6">ou cliquez pour sélectionner</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button as="span">
                  Sélectionner un fichier CSV
                </Button>
              </label>
            </div>

            {/* Format Info */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h4 className="font-bold mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Format attendu
              </h4>
              <div className="bg-background rounded-lg p-4 font-mono text-sm text-text-secondary">
                phone_number,name,tags<br />
                +221701234567,Jean Dupont,vip;customer<br />
                +221702345678,Marie Sall,prospect
              </div>
              <p className="text-text-muted text-sm mt-3">
                • Téléphone au format international (+221...)<br />
                • Tags séparés par des points-virgules
              </p>
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-6">
                <h4 className="font-bold mb-4">Aperçu (5 premières lignes)</h4>
                <div className="space-y-2">
                  {preview.map((contact, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold">{contact.name || 'Sans nom'}</div>
                        <div className="text-sm text-text-muted">{contact.phone_number}</div>
                      </div>
                      {contact.tags?.length > 0 && (
                        <div className="text-xs text-text-muted">
                          {contact.tags.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={handleImport} disabled={importing} className="flex-1">
                    {importing ? 'Importation...' : `Importer ${csvData?.length} contacts`}
                  </Button>
                  <Button variant="outline" onClick={() => { setCsvData(null); setPreview([]); }}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Result
          <div className="bg-surface border border-border rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Importation terminée!</h2>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
              <div className="bg-background rounded-lg p-4">
                <div className="text-3xl font-black text-primary">{result.imported}</div>
                <div className="text-text-muted text-sm">Importés</div>
              </div>
              <div className="bg-background rounded-lg p-4">
                <div className="text-3xl font-black text-text-secondary">{result.skipped}</div>
                <div className="text-text-muted text-sm">Ignorés</div>
              </div>
            </div>
            <Button onClick={() => navigate('/dashboard/contacts')}>Voir mes contacts</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsImport;
