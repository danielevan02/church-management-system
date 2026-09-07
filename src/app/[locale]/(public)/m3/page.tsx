import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Mail,
  MoreVertical,
  Search,
  Settings,
} from "lucide-react";
import { notFound } from "next/navigation";

import { TextField } from "@/components/m3/text-field";

import { NavBarPreview, NavRailPreview } from "./nav-preview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardEyebrow,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Design-system review surface. Not part of the product — a place to eyeball
 * every M3 variant and state side by side, in both themes, before rolling a
 * component out. Kept out of production builds entirely.
 *
 * This is load-bearing for the migration: the reason a design-system rewrite
 * usually stalls is that nobody can see all the states at once, so regressions
 * are found one screen at a time by users.
 */
export default function M3GalleryPage() {
  if (process.env.NODE_ENV === "production") notFound();

  // Literal class strings, not `bg-${role}` — Tailwind scans source text, so
  // interpolated utility names are never generated.
  const roles = [
    ["primary", "bg-primary text-on-primary"],
    ["primary-container", "bg-primary-container text-on-primary-container"],
    ["secondary-container", "bg-secondary-container text-on-secondary-container"],
    ["tertiary-container", "bg-tertiary-container text-on-tertiary-container"],
    ["error", "bg-error text-on-error"],
    ["error-container", "bg-error-container text-on-error-container"],
    ["surface", "bg-surface text-on-surface"],
    ["surface-variant", "bg-surface-variant text-on-surface-variant"],
    ["surface-container-lowest", "bg-surface-container-lowest text-on-surface"],
    ["surface-container-low", "bg-surface-container-low text-on-surface"],
    ["surface-container", "bg-surface-container text-on-surface"],
    ["surface-container-high", "bg-surface-container-high text-on-surface"],
    ["surface-container-highest", "bg-surface-container-highest text-on-surface"],
    ["inverse-surface", "bg-inverse-surface text-inverse-on-surface"],
  ] as const;


  return (
    <main className="mx-auto max-w-5xl space-y-12 p-6 pb-32">
      <header className="space-y-2">
        <h1 className="text-display-sm text-on-surface">Material 3</h1>
        <p className="text-body-lg text-on-surface-variant">
          Token and component review surface. Toggle the theme to check both
          schemes.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-headline-sm">Colour roles</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {roles.map(([name, classes]) => (
            <div
              key={name}
              className={`${classes} rounded-md border border-outline-variant p-3`}
            >
              <p className="text-label-lg">{name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-headline-sm">Type scale</h2>
        <div className="space-y-1">
          <p className="text-display-lg">Display large</p>
          <p className="text-headline-lg">Headline large</p>
          <p className="text-title-lg">Title large</p>
          <p className="text-title-md">Title medium</p>
          <p className="text-body-lg">Body large — the quick brown fox.</p>
          <p className="text-body-md">Body medium — the quick brown fox.</p>
          <p className="text-label-lg">LABEL LARGE</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-headline-sm">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="elevated">Elevated</Button>
          <Button variant="filled">Filled</Button>
          <Button variant="tonal">Tonal</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button variant="destructive">Delete</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="filled" disabled>
            Filled disabled
          </Button>
          <Button variant="outlined" disabled>
            Outlined disabled
          </Button>
          <Button variant="text" disabled>
            Text disabled
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">
            <Search /> xs 32dp
          </Button>
          <Button size="sm">sm 36dp</Button>
          <Button size="default">
            <Search /> default 40dp
          </Button>
          <Button size="lg">lg 56dp</Button>
          <Button size="icon" variant="tonal" aria-label="Search">
            <Search />
          </Button>
          <Button size="fab" variant="tonal" aria-label="Compose">
            <Bell />
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-headline-sm">Cards</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["elevated", "filled", "outlined"] as const).map((variant) => (
            <Card key={variant} variant={variant} interactive>
              <CardHeader>
                <CardEyebrow>Proteksi budget</CardEyebrow>
                <CardTitle className="capitalize">{variant} card</CardTitle>
              </CardHeader>
              <CardContent className="text-body-md text-on-surface-variant">
                Tone carries the hierarchy — no shadow, no border. Hover for the
                state layer.
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-headline-sm">Text fields</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField label="Nama lengkap" supportingText="As it appears on the ID card" />
          <TextField label="Nomor telepon" leadingIcon={<Mail />} defaultValue="+62 812 3456 7890" />
          <TextField label="Email" error="Enter a valid email address" defaultValue="not-an-email" />
          <TextField label="Catatan" maxLength={120} showCounter supportingText="Optional" />
          <TextField label="Filled variant" variant="filled" supportingText="M3 filled field" />
          <TextField label="Disabled" variant="filled" disabled defaultValue="Read only" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-headline-sm">Tabs</h2>
        <Tabs defaultValue="a">
          <TabsList variant="primary">
            <TabsTrigger value="a">Members</TabsTrigger>
            <TabsTrigger value="b">Households</TabsTrigger>
            <TabsTrigger value="c">Cell groups</TabsTrigger>
          </TabsList>
          <TabsContent value="a" className="text-body-md text-on-surface-variant">
            Primary tabs: 3dp indicator hugging the label.
          </TabsContent>
          <TabsContent value="b" />
          <TabsContent value="c" />
        </Tabs>
        <Tabs defaultValue="a">
          <TabsList variant="secondary">
            <TabsTrigger value="a">All</TabsTrigger>
            <TabsTrigger value="b">Active</TabsTrigger>
            <TabsTrigger value="c">Archived</TabsTrigger>
          </TabsList>
          <TabsContent value="a" className="text-body-md text-on-surface-variant">
            Secondary tabs: 2dp full-width indicator.
          </TabsContent>
          <TabsContent value="b" />
          <TabsContent value="c" />
        </Tabs>
      </section>

      <section className="space-y-4">
        <h2 className="text-headline-sm">Dialog</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="tonal">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset this member&apos;s PIN?</DialogTitle>
              <DialogDescription>
                They will need the new PIN to sign in. Their existing sessions
                stay valid.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="text">Cancel</Button>
              <Button variant="text">Reset PIN</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section className="space-y-4">
        <h2 className="text-headline-sm">Badges &amp; alerts</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="tertiary">Tertiary</Badge>
          <Badge variant="success">
            <CheckCircle2 /> Hadir
          </Badge>
          <Badge variant="warning">
            <AlertTriangle /> Konflik
          </Badge>
          <Badge variant="destructive">Nonaktif</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Alert>
            <Bell />
            <AlertTitle>Neutral</AlertTitle>
            <AlertDescription>surface-container-highest.</AlertDescription>
          </Alert>
          <Alert variant="success">
            <CheckCircle2 />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>M3 custom colour role.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertTriangle />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>Replaces the amber utilities.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>error-container pair.</AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-headline-sm">Controls</h2>
        <div className="grid items-start gap-6 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="m3-bare">Bare input (label above)</Label>
            <Input id="m3-bare" placeholder="56dp, M3 outlined" />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="m3-compact">Compact density</Label>
            <Input id="m3-compact" density="compact" placeholder="40dp" />
          </div>
          <div className="grid gap-1">
            <Label>Select</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih pelayanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Ibadah Umum</SelectItem>
                <SelectItem value="b">Ibadah Pemuda</SelectItem>
                <SelectItem value="c">Sekolah Minggu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="m3-textarea">Textarea</Label>
            <Textarea id="m3-textarea" placeholder="Catatan" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Label className="gap-3">
            <Checkbox defaultChecked /> Checked
          </Label>
          <Label className="gap-3">
            <Checkbox /> Unchecked
          </Label>
          <Label className="gap-3">
            <Checkbox disabled defaultChecked /> Disabled
          </Label>
          <ToggleGroup type="single" defaultValue="week">
            <ToggleGroupItem value="day">Hari</ToggleGroupItem>
            <ToggleGroupItem value="week">Minggu</ToggleGroupItem>
            <ToggleGroupItem value="month">Bulan</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outlined" size="icon" aria-label="Actions">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem>
                <Mail /> Kirim pesan
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings /> Ubah data
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Settings /> Bahasa
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Bahasa Indonesia</DropdownMenuItem>
                  <DropdownMenuItem>English</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <AlertTriangle /> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="text">Hover for tooltip</Button>
            </TooltipTrigger>
            <TooltipContent>inverse-surface, no arrow</TooltipContent>
          </Tooltip>
          <Avatar>
            <AvatarFallback>DK</AvatarFallback>
          </Avatar>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-headline-sm">Table</h2>
        <Card variant="outlined" className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Komsel</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Budi Santoso</TableCell>
                <TableCell>Komsel Efrata</TableCell>
                <TableCell>
                  <Badge variant="success">Aktif</Badge>
                </TableCell>
              </TableRow>
              <TableRow data-state="selected">
                <TableCell>Siti Rahayu</TableCell>
                <TableCell>Komsel Betlehem</TableCell>
                <TableCell>
                  <Badge variant="warning">Perlu tindak lanjut</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Andi Wijaya</TableCell>
                <TableCell>—</TableCell>
                <TableCell>
                  <Badge variant="secondary">Belum</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-headline-sm">Navigation</h2>
        <NavRailPreview />
        <p className="text-body-sm text-on-surface-variant">
          The navigation bar is fixed to the viewport bottom below the md
          breakpoint — narrow the window to see it.
        </p>
      </section>

      <NavBarPreview />
    </main>
  );
}
