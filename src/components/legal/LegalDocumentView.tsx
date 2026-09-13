'use client';

import React from 'react';
import { LegalDocumentType, SubprocessorEntry } from '@/types/legal';
import { getLegalDocument, getCompanyLegalConfig } from '@/lib/legal';
import { Badge } from '@/components/ui';

import { ShieldCheck, Calendar, FileText, Globe } from 'lucide-react';

export interface LegalDocumentViewProps {
  documentType: LegalDocumentType;
}

export function LegalDocumentView({ documentType }: LegalDocumentViewProps) {
  const doc = getLegalDocument(documentType);
  const company = getCompanyLegalConfig();

  if (!doc) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p className="text-sm">Legal document not found.</p>
      </div>
    );
  }

  // Cast subprocessors array if present
  const subprocessorsList = (doc as unknown as { subprocessors?: SubprocessorEntry[] }).subprocessors;

  return (
    <article className="space-y-8">
      {/* Header Metadata */}
      <header className="border-b border-zinc-800 pb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="purple" size="sm">
            v{doc.version}
          </Badge>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              Effective: {doc.effectiveDate}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              Last Updated: {doc.lastUpdated}
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">{doc.title}</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">{doc.shortSummary}</p>
      </header>

      {/* Sections */}
      <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
        {doc.sections.map((section) => (
          <section key={section.id} id={section.id} className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              {section.heading}
            </h2>

            {section.paragraphs.map((para, i) => (
              <p key={i} className="text-zinc-300">
                {para}
              </p>
            ))}

            {section.bullets && section.bullets.length > 0 && (
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
                {section.bullets.map((bullet, idx) => (
                  <li key={idx} className="leading-normal">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Subprocessors Table if Document is Subprocessors */}
        {subprocessorsList && subprocessorsList.length > 0 && (
          <section className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              Authorized Third-Party Subprocessors
            </h2>
            <div className="overflow-x-auto border border-zinc-800 rounded-xl">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Subprocessor</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Data Involved</th>
                    <th className="px-4 py-3">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
                  {subprocessorsList.map((sub, i) => (
                    <tr key={i} className="hover:bg-zinc-800/40">
                      <td className="px-4 py-3 font-semibold text-zinc-100">
                        <a
                          href={sub.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-400 hover:underline"
                        >
                          {sub.name}
                        </a>
                      </td>
                      <td className="px-4 py-3">{sub.purpose}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {sub.dataTypes.map((dt, j) => (
                            <span
                              key={j}
                              className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 border border-zinc-700/60"
                            >
                              {dt}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-400">{sub.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Footer Contact Box */}
      <footer className="pt-8 border-t border-zinc-800/80 text-xs text-zinc-500 space-y-1">
        <p>
          Questions about this policy? Email our legal and compliance team at{' '}
          <a href={`mailto:${company.legalEmail}`} className="text-indigo-400 hover:underline font-medium">
            {company.legalEmail}
          </a>
        </p>
      </footer>
    </article>
  );
}
