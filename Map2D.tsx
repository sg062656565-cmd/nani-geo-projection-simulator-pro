
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MapSettings, LightSourceType, LatLng, ProjectionType } from '../types';
import { PROJECTION_CONFIGS, SurfaceType } from '../constants';

interface Globe3DProps {
  settings: MapSettings;
  hoverPos: LatLng;
}

const Globe3D: React.FC<Globe3DProps> = ({ settings, hoverPos }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const surfaceRef = useRef<THREE.Object3D | null>(null);
  const lightRaysRef = useRef<THREE.Object3D | null>(null);
  const tangentRef = useRef<THREE.Object3D | null>(null);
  const markerRef = useRef<THREE.Mesh | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2, 1, 4.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const teachingLight = new THREE.DirectionalLight(0xffffff, 0.8);
    teachingLight.position.set(5, 3, 5);
    scene.add(teachingLight);

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, 1024, 512);
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<=24; i++) { const x = (i/24) * 1024; ctx.moveTo(x, 0); ctx.lineTo(x, 512); }
        for(let i=0; i<=12; i++) { const y = (i/12) * 512; ctx.moveTo(0, y); ctx.lineTo(1024, y); }
        ctx.stroke();
        ctx.fillStyle = '#10b981'; ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.ellipse(512, 256, 200, 100, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(200, 150, 100, 80, 0.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(800, 400, 120, 60, -0.3, 0, Math.PI*2); ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshPhongMaterial({ map: texture, shininess: 5 });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    globeRef.current = globe;

    const markerGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.visible = false;
    scene.add(marker);
    markerRef.current = marker;

    const animate = () => {
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      const [lambda, phi] = settings.rotate;
      globeRef.current.rotation.y = THREE.MathUtils.degToRad(lambda); 
      globeRef.current.rotation.x = THREE.MathUtils.degToRad(phi);
    }
  }, [settings.rotate]);

  useEffect(() => {
    if (markerRef.current && globeRef.current && hoverPos) {
      const [lon, lat] = hoverPos;
      const phi = THREE.MathUtils.degToRad(lat);
      const theta = THREE.MathUtils.degToRad(lon + 90);
      const radius = 1.02;
      const x = radius * Math.cos(phi) * Math.sin(theta);
      const y = radius * Math.sin(phi);
      const z = radius * Math.cos(phi) * Math.cos(theta);
      markerRef.current.position.set(x, y, z);
      markerRef.current.position.applyEuler(globeRef.current.rotation);
      markerRef.current.visible = true;
    } else if (markerRef.current) {
      markerRef.current.visible = false;
    }
  }, [hoverPos, settings.rotate]);

  // Projections Visual Aids
  useEffect(() => {
    if (!sceneRef.current || !globeRef.current) return;
    const scene = sceneRef.current;
    
    const clean = (ref: React.MutableRefObject<THREE.Object3D | null>) => { 
        if (ref.current) { scene.remove(ref.current); ref.current = null; } 
    };
    clean(surfaceRef); clean(lightRaysRef); clean(tangentRef);

    const config = PROJECTION_CONFIGS[settings.projection];
    const surfaceMat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    const tangentMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.8 });

    // 1. Show Projection Surface (The "Paper")
    if (settings.showProjectionSurface) {
        let group = new THREE.Group();
        if (config.surfaceType === SurfaceType.CYLINDER) {
            group.add(new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 3, 32, 1, true), surfaceMat));
        } else if (config.surfaceType === SurfaceType.TRANSVERSE_CYLINDER) {
            const m = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 3, 32, 1, true), surfaceMat);
            m.rotation.z = Math.PI/2;
            group.add(m);
        } else if (config.surfaceType === SurfaceType.CONE) {
            const m = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 32, 1, true), surfaceMat);
            m.position.y = 0.5;
            group.add(m);
        } else if (config.surfaceType === SurfaceType.PLANE) {
            const m = new THREE.Mesh(new THREE.CircleGeometry(2, 32), surfaceMat);
            m.position.z = 1.1;
            group.add(m);
        } else if (config.surfaceType === SurfaceType.PSEUDO || config.surfaceType === SurfaceType.COMPROMISE) {
            // Representing the mathematical bounding box or curved shell for pseudo-projections
            const m = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, Math.PI/4, Math.PI/2), surfaceMat);
            group.add(m);
        }
        surfaceRef.current = group;
        scene.add(group);
    }

    // 2. Show Light Source & Rays
    if (settings.showLightSource) {
        const group = new THREE.Group();
        const lightType = config.lightSourceType;
        const rayMat = new THREE.LineBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.4 });
        
        if (lightType === LightSourceType.CENTER) {
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
            group.add(bulb);
            const dirs = [
                new THREE.Vector3(1.5,0,0), new THREE.Vector3(-1.5,0,0), 
                new THREE.Vector3(0,1.5,0), new THREE.Vector3(0,-1.5,0),
                new THREE.Vector3(1,1,1).normalize().multiplyScalar(1.5),
                new THREE.Vector3(-1,-1,-1).normalize().multiplyScalar(1.5)
            ];
            dirs.forEach(d => {
                const points = [new THREE.Vector3(0,0,0), d];
                const geo = new THREE.BufferGeometry().setFromPoints(points);
                group.add(new THREE.Line(geo, rayMat));
            });
        } else if (lightType === LightSourceType.INFINITY) {
            for(let i=-2; i<=2; i+=0.8) {
                const points = [new THREE.Vector3(i, 1.5, 2), new THREE.Vector3(i, 1.5, -1)];
                const geo = new THREE.BufferGeometry().setFromPoints(points);
                group.add(new THREE.Line(geo, rayMat));
            }
        } else if (lightType === LightSourceType.SURFACE) {
            // Show radial rays from surface outward
            for(let i=0; i<8; i++) {
                const angle = (i/8) * Math.PI * 2;
                const start = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                const end = start.clone().multiplyScalar(1.4);
                group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([start, end]), rayMat));
            }
        }
        lightRaysRef.current = group;
        scene.add(group);
    }

    // 3. Show Tangent / Standard Parallels (Zero Distortion Zones)
    if (settings.showTangent) {
        const group = new THREE.Group();
        const createRing = (radius: number, y: number, color = 0x22d3ee) => {
            const geo = new THREE.TorusGeometry(radius, 0.015, 8, 100);
            const mat = new THREE.MeshBasicMaterial({ color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = Math.PI/2;
            mesh.position.y = y;
            return mesh;
        };

        const createVerticalRing = (radius: number, color = 0x22d3ee) => {
            const geo = new THREE.TorusGeometry(radius, 0.015, 8, 100);
            const mat = new THREE.MeshBasicMaterial({ color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.y = Math.PI/2;
            return mesh;
        };

        // Determine which tangent/standard markers to show based on projection type
        switch(settings.projection) {
            case ProjectionType.MERCATOR:
            case ProjectionType.EQUIRECTANGULAR:
                group.add(createRing(1.01, 0)); // Equator
                break;
            case ProjectionType.TRANSVERSE_MERCATOR:
                group.add(createVerticalRing(1.01)); // Central Meridian
                break;
            case ProjectionType.GALL_PETERS:
                group.add(createRing(Math.cos(Math.PI/4), Math.sin(Math.PI/4))); // 45 N
                group.add(createRing(Math.cos(Math.PI/4), -Math.sin(Math.PI/4))); // 45 S
                break;
            case ProjectionType.CONIC_EQUIDISTANT:
                group.add(createRing(Math.cos(Math.PI/6), Math.sin(Math.PI/6))); // 30 N
                group.add(createRing(Math.cos(5*Math.PI/12), Math.sin(5*Math.PI/12))); // 60 N
                break;
            case ProjectionType.MOLLWEIDE:
                const lat = 40.73 * (Math.PI/180);
                group.add(createRing(Math.cos(lat), Math.sin(lat)));
                group.add(createRing(Math.cos(lat), -Math.sin(lat)));
                break;
            case ProjectionType.ORTHOGRAPHIC:
            case ProjectionType.GNOMONIC:
            case ProjectionType.AZIMUTHAL_EQUAL_AREA:
                // Just a point at the center (the tangent point)
                const point = new THREE.Mesh(new THREE.SphereGeometry(0.05), tangentMat);
                point.position.z = 1.01;
                group.add(point);
                break;
            default:
                group.add(createRing(1.01, 0));
        }

        tangentRef.current = group;
        // The tangent group should rotate WITH the globe to show its world-position
        globeRef.current.add(group); 
    }

  }, [settings.projection, settings.showProjectionSurface, settings.showLightSource, settings.showTangent]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      <div className="absolute top-2 left-2 bg-black/50 text-[10px] px-2 py-1 rounded text-cyan-400 z-10 pointer-events-none">
        3D 教學透視視圖
      </div>
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default Globe3D;
