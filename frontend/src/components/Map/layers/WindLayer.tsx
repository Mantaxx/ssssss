import { useEffect, useMemo, useState } from 'react';
import { useMap } from '../MapContext';
import type { CustomLayerInterface } from 'mapbox-gl';

const vertexShaderSource = `
  attribute vec2 a_pos;
  attribute float a_color;
  uniform mat4 u_matrix;
  varying float v_color;
  void main() {
    gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
    gl_PointSize = 1.0;
    v_color = a_color;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying float v_color;
  void main() {
    // Interpolate color from blue to white based on speed
    vec3 color = mix(vec3(0.0, 0.5, 1.0), vec3(1.0, 1.0, 1.0), v_color);
    gl_FragColor = vec4(color, 0.8); // A bit more visible particles
  }
`;

interface WindData {
  source: string;
  width: number;
  height: number;
  uMin: number;
  uMax: number;
  vMin: number;
  vMax: number;
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
  data: {
    u: number[];
    v: number[];
  };
}

export const WindLayer = () => {
  const { map, altitude, selectedTime } = useMap();
  const [windGrid, setWindGrid] = useState<WindData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWindData = async () => {
      if (!altitude || !selectedTime) return;

      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          altitude,
          time: selectedTime.toISOString(),
        });
        const response = await fetch(`/api/weather/wind?${params}`);
        if (!response.ok) {
          throw new Error(`Błąd sieci: ${response.statusText}`);
        }
        const data: WindData = await response.json();
        setWindGrid(data);
      } catch (err) {
        console.error('Nie udało się pobrać danych o wietrze:', err);
        setError('Nie można załadować danych o wietrze.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWindData();
  }, [altitude, selectedTime]);

  const windLayer: CustomLayerInterface = useMemo(() => {
    let program: WebGLProgram;
    let buffer: WebGLBuffer;
    let wind: any;
    let particles: Float32Array;

    const NUM_PARTICLES = 10000;

    const buildWind = (grid: WindData) => {
      const { u, v } = grid.data;
      const speedMin = Math.sqrt(grid.uMin ** 2 + grid.vMin ** 2);
      const speedMax = Math.sqrt(grid.uMax ** 2 + grid.vMax ** 2);

      return {
        ...grid,
        speedMin,
        speedMax,
        data: (i: number) => [u[i], v[i]],
        interpolate: (x: number, y: number) => {
          if (x < 0 || x >= wind.width - 1 || y < 0 || y >= wind.height - 1) {
            return null;
          }

          const i = Math.floor(x);
          const j = Math.floor(y);
          const fi = x - i;
          const fj = y - j;

          const i0 = i;
          const j0 = j;
          const i1 = i + 1;
          const j1 = j + 1;

          const g00 = wind.data(j0 * wind.width + i0);
          const g10 = wind.data(j0 * wind.width + i1);
          const g01 = wind.data(j1 * wind.width + i0);
          const g11 = wind.data(j1 * wind.width + i1);

          if (!g00 || !g10 || !g01 || !g11) return null;

          const u = (1 - fi) * ((1 - fj) * g00[0] + fj * g01[0]) + fi * ((1 - fj) * g10[0] + fj * g11[0]);
          const v = (1 - fi) * ((1 - fj) * g00[1] + fj * g01[1]) + fi * ((1 - fj) * g10[1] + fj * g11[1]);
          const speed = Math.sqrt(u * u + v * v);

          return [u, v, speed];
        }
      };
    };

    const setupWind = (gl: WebGLRenderingContext) => {
      if (!windGrid) return;
      wind = buildWind(windGrid);
      
      // x, y, color (speed)
      particles = new Float32Array(NUM_PARTICLES * 3);
      for (let i = 0; i < NUM_PARTICLES; i++) {
        particles[i * 3] = Math.random() * 360 - 180;
        particles[i * 3 + 1] = Math.random() * 180 - 90;
        particles[i * 3 + 2] = 0.0;
      }
      
      buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, particles, gl.DYNAMIC_DRAW);
    };

    const evolve = () => {
      if (!wind || !map) return;
      const bounds = map!.getBounds();
      const west = bounds.getWest();
      const east = bounds.getEast();
      const south = bounds.getSouth();
      const north = bounds.getNorth();

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const offset = i * 3;
        let lon = particles[offset];
        let lat = particles[offset + 1];

        if (lon < west || lon > east || lat < south || lat > north) {
            lon = Math.random() * (east - west) + west;
            lat = Math.random() * (north - south) + south;
            particles[offset] = lon;
            particles[offset + 1] = lat;
        }

        const x = (lon - wind.lonMin) * (wind.width / (wind.lonMax - wind.lonMin));
        const y = (wind.latMax - lat) * (wind.height / (wind.latMax - wind.latMin));
        const vector = wind.interpolate(x, y);

        if (vector) {
          const [u, v, speed] = vector;
          particles[offset] += u * 0.01; // Speed factor
          particles[offset + 1] += v * 0.01;
          particles[offset + 2] = (speed - wind.speedMin) / (wind.speedMax - wind.speedMin);
        }
      }
    };

    return {
      id: 'wind-layer',
      type: 'custom',
      renderingMode: '2d',

      onAdd(map, gl) {
        if (!windGrid) return;
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        setupWind(gl);
      },
      render(gl, matrix) {
        if (!wind) return;
        gl.useProgram(program);

        gl.uniformMatrix4fv(
          gl.getUniformLocation(program, 'u_matrix')!,
          false,
          matrix,
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        
        evolve();
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, particles);

        const aPos = gl.getAttribLocation(program, 'a_pos');
        const aColor = gl.getAttribLocation(program, 'a_color');

        gl.enableVertexAttribArray(aPos);
        gl.enableVertexAttribArray(aColor);

        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 12, 0);
        gl.vertexAttribPointer(aColor, 1, gl.FLOAT, false, 12, 8);

        gl.enable(gl.BLEND);
        // Use additive blending for a glowing effect
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

        gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);

        map.triggerRepaint();
      },
    };
  }, [map, windGrid]);

  useEffect(() => {
    if (!map || !windGrid || map.getLayer('wind-layer')) return;

    map.addLayer(windLayer);

    return () => {
      // Check if map and style still exist before removing layer
      if (map && map.getStyle() && map.getLayer('wind-layer')) {
        map.removeLayer('wind-layer');
      }
    };
  }, [map, windLayer, windGrid]);

  if (isLoading) return <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded">Ładowanie danych o wietrze...</div>;
  if (error) return <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 bg-black/50 p-2 rounded">{error}</div>;

  return null;
};
