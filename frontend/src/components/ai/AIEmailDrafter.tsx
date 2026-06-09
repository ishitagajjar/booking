import { useState } from 'react';
import { EnvelopeIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { aiService } from '@/services/aiService';
import { EmailContext } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface AIEmailDrafterProps {
  context: EmailContext;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

export default function AIEmailDrafter({
  context,
  label = 'Draft Email',
  variant = 'secondary',
  size = 'sm',
}: AIEmailDrafterProps) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    setCopied(false);
    try {
      const { data } = await aiService.generateFollowUpEmail(context);
      if (data.IsSuccess && data.Data) {
        setSubject(data.Data.subject);
        setBody(data.Data.body);
      }
    } catch {
      setSubject('Follow-up');
      setBody('Dear Client,\n\nPlease let us know if you have any questions.\n\nBest regards');
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    const text = `Subject: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={handleOpen}>
        <EnvelopeIcon className="h-4 w-4 mr-1" /> {label}
      </Button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="AI Email Draft" maxWidth="max-w-lg">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
              <Button onClick={handleCopy}>
                {copied ? (
                  <><CheckIcon className="h-4 w-4 mr-1" /> Copied!</>
                ) : (
                  <><ClipboardDocumentIcon className="h-4 w-4 mr-1" /> Copy to Clipboard</>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
