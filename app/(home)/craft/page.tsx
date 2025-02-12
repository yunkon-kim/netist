"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Link2,
  Cloud,
  Layout,
  List,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
// import styles from "@/styles/craft/craft.module.css";

interface VNET {
  id: number;
  name: string;
  provider: string;
  region: string;
  cidr: string;
  position: {
    x: number;
    y: number;
  };
}

interface Connection {
  id: number;
  source: number;
  target: number;
  status: "active" | "pending";
}

export default function Craft() {
  // Add this for referencing topology container
  const topologyRef = React.useRef<HTMLDivElement>(null);

  // Calculate position of vNet cards
  const calculatePositions = (
    count: number,
    containerWidth: number,
    containerHeight: number
  ) => {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const radius = Math.min(centerX, centerY) * 0.6; // set radius 60% of container size

    const positions = [];
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      positions.push({
        x: centerX + radius * Math.cos(angle) - 96, // half of w-48 (192px)
        y: centerY + radius * Math.sin(angle) - 40, // half of card height
      });
    }
    return positions;
  };

  const initialVnets = [
    {
      id: 1,
      name: "VNET-1",
      provider: "AWS",
      region: "ap-northeast-2",
      cidr: "10.0.0.0/16",
    },
    {
      id: 2,
      name: "VNET-2",
      provider: "GCP",
      region: "asia-northeast3",
      cidr: "172.16.0.0/16",
    },
    {
      id: 3,
      name: "VNET-3",
      provider: "Azure",
      region: "koreacentral",
      cidr: "192.168.0.0/16",
    },
  ];

  // Set initial VNET positions temporarily
  const [vnets, setVnets] = useState<VNET[]>(
    initialVnets.map((vnet) => ({
      ...vnet,
      position: { x: 0, y: 0 },
    }))
  );

  // Calculate vNet positions on mounting component
  useEffect(() => {
    if (topologyRef.current) {
      const container = topologyRef.current;
      const { width, height } = container.getBoundingClientRect();
      const positions = calculatePositions(initialVnets.length, width, height);

      setVnets((prev) =>
        prev.map((vnet, index) => ({
          ...vnet,
          position: positions[index],
        }))
      );
    }
  }, [initialVnets.length]);

  const [connections, setConnections] = useState<Connection[]>([
    { id: 1, source: 1, target: 2, status: "active" },
  ]);

  const [selectedVnets, setSelectedVnets] = useState<number[]>([]);
  const [draggedVnet, setDraggedVnet] = useState<VNET | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 2;
  const SCALE_STEP = 0.1;
  const [isMouseInTopology, setIsMouseInTopology] = useState(false);

  // 배경 드래그 상태 추가
  const [isDraggingBackground, setIsDraggingBackground] = useState(false);
  const [backgroundDragStart, setBackgroundDragStart] = useState({
    x: 0,
    y: 0,
  });

  const handleZoom = useCallback((delta: number) => {
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)));
  }, []);

  useEffect(() => {
    const preventZoom = (e: Event) => {
      if (!isMouseInTopology) return;

      const keyboardEvent = e as KeyboardEvent;
      if (
        (keyboardEvent.ctrlKey || keyboardEvent.metaKey) &&
        (keyboardEvent.key === "+" ||
          keyboardEvent.key === "-" ||
          keyboardEvent.key === "=")
      ) {
        e.preventDefault();
      }
    };

    const preventWheelZoom = (e: Event) => {
      if (!isMouseInTopology) return;

      const wheelEvent = e as WheelEvent;
      if (wheelEvent.ctrlKey || wheelEvent.metaKey) {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", preventZoom as EventListener);
    document.addEventListener("wheel", preventWheelZoom as EventListener, {
      passive: false,
    });

    return () => {
      document.removeEventListener("keydown", preventZoom as EventListener);
      document.removeEventListener("wheel", preventWheelZoom as EventListener);
    };
  }, [isMouseInTopology]);

  const handleVnetSelect = (vnetId: number) => {
    if (selectedVnets.includes(vnetId)) {
      setSelectedVnets(selectedVnets.filter((id) => id !== vnetId));
    } else if (selectedVnets.length < 2) {
      setSelectedVnets([...selectedVnets, vnetId]);
    }
  };

  const handleCreateConnection = () => {
    if (selectedVnets.length === 2) {
      const newConnection: Connection = {
        id: connections.length + 1,
        source: selectedVnets[0],
        target: selectedVnets[1],
        status: "pending" as const,
      };
      setConnections([...connections, newConnection]);
      setSelectedVnets([]);
    }
  };

  const handleDragStart = (e: React.MouseEvent, vnet: VNET) => {
    e.preventDefault(); // Prevent text selection
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggedVnet(vnet);
  };

  // handler to start dragging the background
  const handleBackgroundDragStart = (e: React.MouseEvent<SVGRectElement>) => {
    setIsDraggingBackground(true);
    setBackgroundDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // handler to drag
  const handleDrag = (e: React.MouseEvent) => {
    if (draggedVnet) {
      // logic to drag the vnet card
      const containerRect = (
        e.currentTarget as HTMLElement
      ).getBoundingClientRect();
      const newVnets = vnets.map((vnet) => {
        if (vnet.id === draggedVnet.id) {
          return {
            ...vnet,
            position: {
              x: (e.clientX - containerRect.left - dragOffset.x) / scale,
              y: (e.clientY - containerRect.top - dragOffset.y) / scale,
            },
          };
        }
        return vnet;
      });
      setVnets(newVnets);
    } else if (isDraggingBackground) {
      // logic to drag the background
      const dx = (e.clientX - backgroundDragStart.x) / scale;
      const dy = (e.clientY - backgroundDragStart.y) / scale;

      setVnets((prev) =>
        prev.map((vnet) => ({
          ...vnet,
          position: {
            x: vnet.position.x + dx,
            y: vnet.position.y + dy,
          },
        }))
      );

      setBackgroundDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  // handler to end dragging
  const handleDragEnd = () => {
    setDraggedVnet(null);
    setIsDraggingBackground(false);
  };

  const TopologyView = () => (
    <div className="relative space-y-2">
      <div
        ref={topologyRef}
        className="relative w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden select-none topology-container"
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => {
          handleDragEnd();
          setIsMouseInTopology(false);
        }}
        onMouseEnter={() => setIsMouseInTopology(true)}
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
            handleZoom(delta);
          }
        }}
        style={{ cursor: isDraggingBackground ? "grabbing" : "grab" }}
        tabIndex={0} // needed to keyboard events
      >
        <div
          className="absolute inset-0 origin-center transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
        >
          <svg className="absolute inset-0 w-full h-full">
            {/* transparent rect to drag background */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="transparent"
              onMouseDown={handleBackgroundDragStart}
              style={{ cursor: isDraggingBackground ? "grabbing" : "grab" }}
            />

            {/* connection lines */}
            {connections.map((conn) => {
              const sourceVnet = vnets.find((vnet) => vnet.id === conn.source);
              const targetVnet = vnets.find((vnet) => vnet.id === conn.target);
              if (!sourceVnet || !targetVnet) return null;
              return (
                <g key={conn.id}>
                  <line
                    x1={sourceVnet.position.x + 75}
                    y1={sourceVnet.position.y + 50}
                    x2={targetVnet.position.x + 75}
                    y2={targetVnet.position.y + 50}
                    stroke={conn.status === "active" ? "#10B981" : "#FCD34D"}
                    strokeWidth="2"
                    strokeDasharray={conn.status === "pending" ? "5,5" : ""}
                  />
                  <circle
                    cx={
                      (sourceVnet.position.x + targetVnet.position.x) / 2 + 75
                    }
                    cy={
                      (sourceVnet.position.y + targetVnet.position.y) / 2 + 50
                    }
                    r="4"
                    fill={conn.status === "active" ? "#10B981" : "#FCD34D"}
                  />
                </g>
              );
            })}
          </svg>

          {vnets.map((vnet) => (
            <div
              key={vnet.id}
              className={`absolute cursor-move p-4 w-48 bg-white rounded-lg shadow-lg select-none ${
                selectedVnets.includes(vnet.id) ? "ring-2 ring-blue-500" : ""
              }`}
              style={{
                left: vnet.position.x,
                top: vnet.position.y,
                transition:
                  draggedVnet?.id === vnet.id ? "none" : "all 0.3s ease",
              }}
              onClick={() => handleVnetSelect(vnet.id)}
              onMouseDown={(e) => handleDragStart(e, vnet)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Cloud
                  size={20}
                  className={
                    vnet.provider === "AWS"
                      ? "text-orange-500"
                      : vnet.provider === "GCP"
                      ? "text-red-500"
                      : "text-blue-500"
                  }
                />
                <span className="font-medium">{vnet.name}</span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  {vnet.provider} - {vnet.region}
                </p>
                <p>{vnet.cidr}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleZoom(-SCALE_STEP)}
          disabled={scale <= MIN_SCALE}
        >
          <ZoomOut size={16} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleZoom(SCALE_STEP)}
          disabled={scale >= MAX_SCALE}
        >
          <ZoomIn size={16} />
        </Button>
        <span className="px-2 py-1 text-sm text-gray-500 border rounded">
          {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-3 space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Network Management Dashboard</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Create New VNET
        </Button>
      </div>

      <Tabs defaultValue="topology">
        <TabsList>
          <TabsTrigger value="topology" className="flex items-center gap-2">
            <Layout size={16} />
            Topology View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List size={16} />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topology" className="space-y-6">
          <TopologyView />

          <div className="flex justify-center">
            <Button
              className="flex items-center gap-2"
              disabled={selectedVnets.length !== 2}
              onClick={handleCreateConnection}
            >
              <Link2 size={16} />
              Create VPN Connection
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vnets.map((vnet) => (
              <Card
                key={vnet.id}
                className={`cursor-pointer transition-all ${
                  selectedVnets.includes(vnet.id) ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => handleVnetSelect(vnet.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Cloud size={20} />
                    {vnet.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Provider: {vnet.provider}
                    </p>
                    <p className="text-sm text-gray-600">
                      Region: {vnet.region}
                    </p>
                    <p className="text-sm text-gray-600">CIDR: {vnet.cidr}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Active Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections.map((conn) => {
              const sourceVnet = vnets.find((vnet) => vnet.id === conn.source);
              const targetVnet = vnets.find((vnet) => vnet.id === conn.target);
              return (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{sourceVnet?.name}</p>
                      <p className="text-sm text-gray-600">
                        {sourceVnet?.provider}
                      </p>
                    </div>
                    <Link2 className="text-gray-400" />
                    <div>
                      <p className="font-medium">{targetVnet?.name}</p>
                      <p className="text-sm text-gray-600">
                        {targetVnet?.provider}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      conn.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {conn.status}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
