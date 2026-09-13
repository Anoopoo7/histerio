'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Button, Badge } from '@/components/ui';
import { Check, Copy, Terminal } from 'lucide-react';
import { Template } from '@/types';

export interface SendApiCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
  sampleDataJson?: string;
}

export type CodeLanguage = 'curl' | 'javascript' | 'python' | 'java' | 'go';

export function SendApiCodeModal({
  isOpen,
  onClose,
  template,
  sampleDataJson = '{\n  "customer": { "name": "John Doe" },\n  "order": { "id": "ORD-123" }\n}',
}: SendApiCodeModalProps) {
  const [activeLang, setActiveLang] = useState<CodeLanguage>('curl');
  const [copied, setCopied] = useState(false);

  const parsedDataObj = useMemo(() => {
    try {
      return JSON.parse(sampleDataJson);
    } catch {
      return { customer: { name: 'John Doe' }, order: { id: 'ORD-123' } };
    }
  }, [sampleDataJson]);

  const targetUrl = `${process.env.NEXT_PUBLIC_PROXY_URL || 'http://localhost:8080'}/v1/emails/send`;
  const templateIdentifier = template.slug || template.id;

  const payloads = useMemo(() => {
    const jsonBody = JSON.stringify(
      {
        templateId: templateIdentifier,
        to: 'recipient@example.com',
        data: parsedDataObj,
      },
      null,
      2
    );

    const curlSnippet = `curl -X POST '${targetUrl}' \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: YOUR_API_KEY' \\
  -d '${jsonBody}'`;

    const jsSnippet = `const response = await fetch('${targetUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY',
  },
  body: JSON.stringify(${jsonBody}),
});

const result = await response.json();
console.log(result);`;

    const pythonSnippet = `import requests

url = "${targetUrl}"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
}
payload = ${JSON.stringify(
      {
        templateId: templateIdentifier,
        to: 'recipient@example.com',
        data: parsedDataObj,
      },
      null,
      4
    )
        .replace(/true/g, 'True')
        .replace(/false/g, 'False')
        .replace(/null/g, 'None')}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code, response.json())`;

    const javaSnippet = `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class EmailSender {
    public static void main(String[] args) throws Exception {
        String jsonPayload = """
${jsonBody}
""";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("${targetUrl}"))
                .header("Content-Type", "application/json")
                .header("x-api-key", "YOUR_API_KEY")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}`;

    const goSnippet = `package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	url := "${targetUrl}"
	var jsonStr = []byte(\`${jsonBody}\`)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", "YOUR_API_KEY")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println(string(body))
}`;

    return {
      curl: curlSnippet,
      javascript: jsSnippet,
      python: pythonSnippet,
      java: javaSnippet,
      go: goSnippet,
    };
  }, [targetUrl, templateIdentifier, parsedDataObj]);

  const activeSnippet = payloads[activeLang];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const langTabs: { id: CodeLanguage; label: string }[] = [
    { id: 'curl', label: 'cURL' },
    { id: 'javascript', label: 'JavaScript / Node' },
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'go', label: 'Go' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Email via API"
      description={`Integration code snippet for triggering template "${template.name}"`}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-zinc-400">
            Endpoint: <code className="text-indigo-400 font-mono">POST /v1/emails/send</code>
          </span>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Notice Info Banner */}
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Replace <code className="text-zinc-100 font-bold">YOUR_API_KEY</code> with an active API key from the dashboard.
            </span>
          </div>
          <Badge variant="purple" size="sm" dot={false}>
            Public API
          </Badge>
        </div>

        {/* Language Tabs & Copy Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {langTabs.map((tab) => {
              const isSelected = tab.id === activeLang;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveLang(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isSelected
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
        </div>

        {/* Code Display Area */}
        <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-x-auto max-h-[380px] font-mono text-xs text-emerald-300/90 leading-relaxed shadow-inner">
          <pre>{activeSnippet}</pre>
        </div>
      </div>
    </Modal>
  );
}
