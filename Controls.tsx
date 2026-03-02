
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { geoMollweide, geoCylindricalEqualArea, geoSinusoidal, geoRobinson } from 'd3-geo-projection';
import * as topojson from 'topojson-client';
import { MapSettings, ProjectionType, LatLng } from '../types';
import { WORLD_TOPOJSON_URL, PROJECTION_CONFIGS, SurfaceType, COUNTRY_CN_MAP } from '../constants';

interface Map2DProps {
  settings: MapSettings;
  setSettings: React.Dispatch<React.SetStateAction<MapSettings>>;
  onHover: (pos: LatLng) => void;
  hoverPos: LatLng;
}

const Map2D: React.FC<Map2DProps> = ({ settings, setSettings, onHover, hoverPos }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);
  
  const isDragging = useRef(false);
  const startPos = useRef([0, 0]);
  const projectionRef = useRef<d3.GeoProjection | null>(null);

  useEffect(() => {
    fetch(WORLD_TOPOJSON_URL)
      .then(res => res.json())
      .then(topology => {
        const countries = topojson.feature(topology, topology.objects.countries);
        setGeoData(countries);
      })
      .catch(err => console.error("Failed to load map data", err));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    let projection: d3.GeoProjection;

    switch (settings.projection) {
      case ProjectionType.MERCATOR: projection = d3.geoMercator(); break;
      case ProjectionType.TRANSVERSE_MERCATOR: projection = d3.geoTransverseMercator(); break;
      case ProjectionType.EQUIRECTANGULAR: projection = d3.geoEquirectangular(); break;
      case ProjectionType.ORTHOGRAPHIC: projection = d3.geoOrthographic(); break;
      case ProjectionType.AZIMUTHAL_EQUAL_AREA: projection = d3.geoAzimuthalEqualArea(); break;
      case ProjectionType.MOLLWEIDE: projection = geoMollweide(); break;
      case ProjectionType.SINUSOIDAL: projection = geoSinusoidal(); break;
      case ProjectionType.ROBINSON: projection = geoRobinson(); break;
      case ProjectionType.GALL_PETERS: projection = geoCylindricalEqualArea().parallel(45); break;
      case ProjectionType.CONIC_EQUIDISTANT: projection = d3.geoConicEquidistant().parallels([20, 50]); break;
      case ProjectionType.GNOMONIC: projection = d3.geoGnomonic(); break;
      default: projection = d3.geoMercator();
    }

    projection
      .scale(settings.scale)
      .translate([width / 2, height / 2])
      .rotate(settings.rotate);
    
    projectionRef.current = projection;

    const pathGenerator = d3.geoPath().projection(projection);
    const mapGroup = svg.append("g");

    if (settings.showGraticule) {
      const graticule = d3.geoGraticule();
      mapGroup.append("path")
        .datum(graticule())
        .attr("d", pathGenerator)
        .attr("fill", "none")
        .attr("stroke", "#374151")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.7);
    }

    if (settings.showCountries) {
      mapGroup.selectAll(".country")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", pathGenerator as any)
        .attr("fill", "#10b981")
        .attr("stroke", "#064e3b")
        .attr("stroke-width", 0.5)
        .style("transition", "fill 0.2s")
        .on("pointerover", function() {
            d3.select(this).attr("fill", "#34d399");
        })
        .on("pointerout", function() {
            d3.select(this).attr("fill", "#10b981");
        });
    }

    if (settings.showTissot) {
      const step = 30;
      const circles = [];
      for (let y = -80; y <= 80; y += step) {
        for (let x = -180; x < 180; x += step) {
          circles.push(d3.geoCircle().center([x, y]).radius(5)());
        }
      }
      mapGroup.selectAll(".tissot")
        .data(circles)
        .enter()
        .append("path")
        .attr("d", pathGenerator as any)
        .attr("fill", "rgba(239, 68, 68, 0.3)")
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 0.5);
    }

    if (hoverPos) {
      const coords = projection(hoverPos);
      if (coords) {
        mapGroup.append("circle")
          .attr("cx", coords[0])
          .attr("cy", coords[1])
          .attr("r", 6)
          .attr("fill", "none")
          .attr("stroke", "#22d3ee")
          .attr("stroke-width", 2);
        
        mapGroup.append("circle")
          .attr("cx", coords[0])
          .attr("cy", coords[1])
          .attr("r", 2)
          .attr("fill", "#22d3ee");
      }
    }

  }, [geoData, dimensions, settings, hoverPos]);

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (isDragging.current) {
        const dx = e.clientX - startPos.current[0];
        const dy = e.clientY - startPos.current[1];
        const sensitivity = 0.25;
        setSettings(prev => ({
          ...prev,
          rotate: [
            prev.rotate[0] + dx * sensitivity, 
            prev.projection === ProjectionType.TRANSVERSE_MERCATOR ? prev.rotate[1] - dy * sensitivity : prev.rotate[1],
            prev.rotate[2]
          ]
        }));
        startPos.current = [e.clientX, e.clientY];
    } else if (projectionRef.current && svgRef.current) {
        const latlng = projectionRef.current.invert?.([x, y]);
        if (latlng) {
            onHover(latlng as [number, number]);
            
            // 國家偵測邏輯 + 中文化處理
            if (settings.showCountryNames && geoData) {
                const found = geoData.features.find((f: any) => d3.geoContains(f, latlng as [number, number]));
                if (found) {
                    const enName = found.properties.name;
                    setHoveredCountry(COUNTRY_CN_MAP[enName] || enName);
                } else {
                    setHoveredCountry(null);
                }
            } else {
                setHoveredCountry(null);
            }
        }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-inner">
      <div className="absolute top-2 left-2 bg-black/50 text-[10px] px-2 py-1 rounded text-emerald-400 pointer-events-none z-10 flex flex-col gap-1">
        <span>{settings.projection}</span>
        {hoverPos && <span className="text-cyan-400 font-mono">Lon: {hoverPos[0].toFixed(1)}°, Lat: {hoverPos[1].toFixed(1)}°</span>}
      </div>

      {/* 國家名稱標籤 - 樣式優化為更符合教學風格 */}
      {settings.showCountryNames && hoveredCountry && mousePos && (
        <div 
            className="absolute z-50 pointer-events-none bg-slate-950/95 border border-cyan-500/50 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)] backdrop-blur-md flex items-center gap-2"
            style={{ 
                left: mousePos.x + 20, 
                top: mousePos.y - 40,
                transform: 'translate(0, 0)'
            }}
        >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            {hoveredCountry}
        </div>
      )}

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ cursor: 'crosshair' }}
        onPointerDown={(e) => { isDragging.current = true; startPos.current = [e.clientX, e.clientY]; svgRef.current?.setPointerCapture(e.pointerId); }}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => { isDragging.current = false; svgRef.current?.releasePointerCapture(e.pointerId); }}
        onPointerLeave={() => { onHover(null); setHoveredCountry(null); }}
      />
    </div>
  );
};

export default Map2D;
