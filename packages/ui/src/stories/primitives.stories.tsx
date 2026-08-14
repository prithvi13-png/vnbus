import type { Meta, StoryObj } from "@storybook/react";
import { Bus, CalendarDays, CreditCard, Users } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  PasswordInput,
  Progress,
  RadioGroup,
  RadioGroupItem,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatisticCard,
  StatusChip,
  Switch,
  Tag,
  Textarea,
} from "..";

const meta = {
  title: "Design System/Primitives",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controls: Story = {
  render: () => (
    <div className="grid max-w-5xl gap-6 bg-gray-50 p-6">
      <section className="flex flex-wrap gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button loading>Loading</Button>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <Label className="grid gap-2">
          Input
          <Input placeholder="Bengaluru" />
        </Label>
        <Label className="grid gap-2">
          Search
          <SearchInput placeholder="Search routes" />
        </Label>
        <Label className="grid gap-2">
          Password
          <PasswordInput placeholder="Password" />
        </Label>
        <Label className="grid gap-2">
          Select
          <Select defaultValue="customer">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="agent">Travel Agent</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </Label>
      </section>
      <Textarea placeholder="Internal note" />
      <div className="flex flex-wrap items-center gap-4">
        <Checkbox aria-label="Accept" defaultChecked />
        <RadioGroup defaultValue="one" className="flex">
          <RadioGroupItem value="one" aria-label="One" />
          <RadioGroupItem value="two" aria-label="Two" />
        </RadioGroup>
        <Switch aria-label="Toggle notifications" defaultChecked />
        <Badge>Default</Badge>
        <Tag>Route</Tag>
        <StatusChip tone="success">Active</StatusChip>
      </div>
      <Alert>
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>Settings are ready for review.</AlertDescription>
      </Alert>
      <Progress value={72} />
      <div className="grid gap-4 md:grid-cols-3">
        <StatisticCard
          label="Bookings"
          value="1,284"
          change="12% this week"
          trend="up"
          icon={Bus}
        />
        <StatisticCard
          label="Customers"
          value="18.2k"
          change="5% this month"
          trend="up"
          icon={Users}
        />
        <StatisticCard
          label="Revenue"
          value="INR 24.8L"
          change="3% lower"
          trend="down"
          icon={CreditCard}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>VN</AvatarFallback>
          </Avatar>
          <CalendarDays className="h-5 w-5 text-blue-700" />
        </CardContent>
      </Card>
    </div>
  ),
};
