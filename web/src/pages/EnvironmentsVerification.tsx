import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Server, Key, Clock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchEnvironments, type SdkEnvironment } from '@/lib/environment-sdk';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type Status = 'idle' | 'loading' | 'success' | 'error';

const EnvironmentsVerification: React.FC = () => {
  const [environments, setEnvironments] = useState<SdkEnvironment[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [source, setSource] = useState<'api' | 'mock'>('mock');
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const load = async () => {
    setStatus('loading');
    try {
      const data = await fetchEnvironments();
      setEnvironments(data);
      setSource(import.meta.env.VITE_ENABLE_SDK_INTEGRATION === 'true' ? 'api' : 'mock');
      setStatus('success');
      setLastFetched(new Date().toLocaleTimeString());
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const maskKey = (key: string) => {
    if (!key || key.length < 8) return '••••••••';
    return key.slice(0, 4) + '••••' + key.slice(-4);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="space-y-1"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Environments
            </h1>
            <Badge
              variant="outline"
              className="ml-2 font-mono text-[10px] uppercase tracking-widest"
            >
              Verification
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground pl-12">
            Read-only view — confirms SDK integration and data structures.
          </p>
        </motion.div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Server className="h-3.5 w-3.5" />
                  <span>Source:</span>
                  <Badge
                    variant={source === 'api' ? 'default' : 'secondary'}
                    className="font-mono text-[10px]"
                  >
                    {source === 'api' ? 'LIVE API' : 'MOCK DATA'}
                  </Badge>
                </div>
                {status === 'success' && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-badge-green-fg" />
                    <span>{environments.length} environments loaded</span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Failed to fetch</span>
                  </div>
                )}
                {lastFetched && (
                  <span className="text-[10px] text-muted-foreground/60">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {lastFetched}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={load}
                disabled={status === 'loading'}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Environment Registry</CardTitle>
              <CardDescription className="text-xs">
                All environments as returned by the SDK layer.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">ID</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">Label</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">Region</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">API Base URL</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">API Key</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {status === 'loading' ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i} className="border-border/30">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <AnimatePresence>
                      {environments.map((env, i) => (
                        <motion.tr
                          key={env.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.3 }}
                          className="border-b border-border/30 transition-colors hover:bg-muted/30"
                        >
                          <TableCell className="font-mono text-xs text-foreground/80">{env.id}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {env.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              {env.region}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{env.api_base_url}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Key className="h-3 w-3" />
                              <span className="font-mono">{maskKey(env.api_key)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground/60">
                            {new Date(env.updated_at).toLocaleDateString()}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EnvironmentsVerification;