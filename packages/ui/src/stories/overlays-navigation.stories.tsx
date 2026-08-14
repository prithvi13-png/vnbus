import type { Meta, StoryObj } from "@storybook/react";
import { BarChart3, Bus, Home, Settings, User } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Footer,
  NavigationMenu,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sidebar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "..";

const meta = {
  title: "Design System/Overlays and Navigation",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const navItems = [
  { href: "#", label: "Home", icon: Home, active: true },
  { href: "#", label: "Analytics", icon: BarChart3 },
  { href: "#", label: "Settings", icon: Settings },
];

export const Patterns: Story = {
  render: () => (
    <div className="grid gap-6 bg-gray-50 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <NavigationMenu items={navItems} />
      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <Sidebar
          brand={<span className="font-semibold">Vriddhi Nexus</span>}
          items={navItems}
          footer={<span className="text-xs text-gray-500">v0.3</span>}
          className="h-80"
        />
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview content</TabsContent>
          <TabsContent value="reports">Reports content</TabsContent>
        </Tabs>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="faq">
          <AccordionTrigger>How does RBAC work?</AccordionTrigger>
          <AccordionContent>
            Roles grant permissions, and permissions gate actions.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm change</DialogTitle>
              <DialogDescription>This modal uses the shared dialog primitive.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Drawer>
          <DialogTrigger asChild>
            <Button variant="outline">Drawer</Button>
          </DialogTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Mobile navigation</DrawerTitle>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Popover</Button>
          </PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <User className="h-4 w-4" aria-hidden="true" />
              Account
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline" aria-label="Bus">
                <Bus className="h-4 w-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bus search</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Footer
        brand={<span className="font-semibold">Vriddhi Nexus Pvt Ltd</span>}
        copyright="Copyright Vriddhi Nexus Pvt Ltd"
        columns={[
          { title: "Company", links: [{ label: "About", href: "#" }] },
          { title: "Support", links: [{ label: "Contact", href: "#" }] },
          { title: "Legal", links: [{ label: "Privacy", href: "#" }] },
        ]}
      />
    </div>
  ),
};
