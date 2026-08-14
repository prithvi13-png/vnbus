"use client";

import type { RoutePreview } from "@vnbus/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vnbus/ui";

export function RouteMapPreview({ preview }: { preview: RoutePreview }): React.JSX.Element {
  const [west, south, east, north] = preview.mapBounds;
  const sourceMarker = `${preview.from.latitude},${preview.from.longitude}`;
  const destinationMarker = `${preview.to.latitude},${preview.to.longitude}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${encodeURIComponent(sourceMarker)}&marker=${encodeURIComponent(destinationMarker)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Preview</CardTitle>
        <CardDescription>
          {preview.from.city} to {preview.to.city} · {preview.distanceKm} km · OpenStreetMap
        </CardDescription>
      </CardHeader>
      <CardContent>
        <iframe
          title={`${preview.from.city} to ${preview.to.city} route preview`}
          src={mapUrl}
          loading="lazy"
          className="h-56 w-full rounded-md border border-gray-200 dark:border-gray-800"
        />
      </CardContent>
    </Card>
  );
}
