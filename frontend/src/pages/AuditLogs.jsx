import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { History, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuditLogs } from '@/hooks/useAuditLogs';
export default function AuditLogs() {
  const { logs, loading, totalCount, fetchLogs, getTableNames } = useAuditLogs();
  const [tableNames, setTableNames] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 50;
  
  const [tableFilter, setTableFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  useEffect(() => {
    fetchLogs({
      table_name: tableFilter || undefined,
      action: actionFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }, page, pageSize);
  }, [fetchLogs, tableFilter, actionFilter, dateFrom, dateTo, page]);
  useEffect(() => {
    getTableNames().then(setTableNames);
  }, [getTableNames]);
  const getActionBadge = (action) => {
    switch (action) {
      case 'INSERT':
        return <Badge className="bg-green-500">Created</Badge>;
      case 'UPDATE':
        return <Badge className="bg-blue-500">Updated</Badge>;
      case 'DELETE':
        return <Badge variant="destructive">Deleted</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };
  const formatTableName = (name) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };
  const totalPages = Math.ceil(totalCount / pageSize);
  const getRecordSummary = (log) => {
    const data = log.new_data || log.old_data;
    if (!data)
      return '-';
    
    if (data.name)
      return data.name;
    if (data.sku)
      return data.sku;
    if (data.sale_number)
      return data.sale_number;
    if (data.stocktake_number)
      return data.stocktake_number;
    if (data.po_number)
      return data.po_number;
    if (data.email)
      return data.email;
    return log.record_id?.slice(0, 8) || '-';
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <History className="h-8 w-8" />
          Audit Logs
        </h1>
        <p className="text-muted-foreground">
          Track all changes to inventory, sales, and other data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={tableFilter || '__all__'} onValueChange={(val) => setTableFilter(val === '__all__' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder="All Tables" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Tables</SelectItem>
                {tableNames.map(table => (<SelectItem key={table} value={table}>
                  {formatTableName(table)}
                </SelectItem>))}
              </SelectContent>
            </Select>

            <Select value={actionFilter || '__all__'} onValueChange={(val) => setActionFilter(val === '__all__' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Actions</SelectItem>
                <SelectItem value="INSERT">Created</SelectItem>
                <SelectItem value="UPDATE">Updated</SelectItem>
                <SelectItem value="DELETE">Deleted</SelectItem>
              </SelectContent>
            </Select>

            <Input type="date" placeholder="From date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />

            <Input type="date" placeholder="To date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>
            Showing {logs.length} of {totalCount} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (<p className="text-center py-8 text-muted-foreground">Loading...</p>) : logs.length === 0 ? (<p className="text-center py-8 text-muted-foreground">No audit logs found</p>) : (<>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (<TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    {log.user_name || log.user_email || 'System'}
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>{formatTableName(log.table_name)}</TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {getRecordSummary(log)}
                  </TableCell>
                  <TableCell>
                    {log.changed_fields?.length ? (<span className="text-sm text-muted-foreground">
                      {log.changed_fields.slice(0, 3).join(', ')}
                      {log.changed_fields.length > 3 && ` +${log.changed_fields.length - 3} more`}
                    </span>) : ('-')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>))}
              </TableBody>
            </Table>

            {}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>)}
        </CardContent>
      </Card>

      {}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (<div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Timestamp</p>
                <p className="font-medium">
                  {format(new Date(selectedLog.created_at), 'MMM d, yyyy HH:mm:ss')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">User</p>
                <p className="font-medium">
                  {selectedLog.user_name || selectedLog.user_email || 'System'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Action</p>
                <div>{getActionBadge(selectedLog.action)}</div>
              </div>
              <div>
                <p className="text-muted-foreground">Table</p>
                <p className="font-medium">{formatTableName(selectedLog.table_name)}</p>
              </div>
            </div>

            {selectedLog.changed_fields && selectedLog.changed_fields.length > 0 && (<div>
              <p className="text-muted-foreground text-sm mb-2">Changed Fields</p>
              <div className="flex flex-wrap gap-1">
                {selectedLog.changed_fields.map((field) => (<Badge key={field} variant="outline">{field}</Badge>))}
              </div>
            </div>)}

            {selectedLog.action === 'UPDATE' && selectedLog.old_data && selectedLog.new_data && (<div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Previous Values</p>
                <ScrollArea className="h-[200px] border rounded-md p-3 bg-muted/50">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(Object.fromEntries((selectedLog.changed_fields || []).map((f) => [f, selectedLog.old_data[f]])), null, 2)}
                  </pre>
                </ScrollArea>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-2">New Values</p>
                <ScrollArea className="h-[200px] border rounded-md p-3 bg-muted/50">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(Object.fromEntries((selectedLog.changed_fields || []).map((f) => [f, selectedLog.new_data[f]])), null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </div>)}

            {selectedLog.action === 'INSERT' && selectedLog.new_data && (<div>
              <p className="text-muted-foreground text-sm mb-2">Created Data</p>
              <ScrollArea className="h-[250px] border rounded-md p-3 bg-muted/50">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(selectedLog.new_data, null, 2)}
                </pre>
              </ScrollArea>
            </div>)}

            {selectedLog.action === 'DELETE' && selectedLog.old_data && (<div>
              <p className="text-muted-foreground text-sm mb-2">Deleted Data</p>
              <ScrollArea className="h-[250px] border rounded-md p-3 bg-muted/50">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(selectedLog.old_data, null, 2)}
                </pre>
              </ScrollArea>
            </div>)}
          </div>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
