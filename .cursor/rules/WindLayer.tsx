import { useEffect, useMemo } from 'react';
import { useMap } from '../MapContext';
import type { CustomLayerInterface, LngLatBounds } from 'mapbox-gl';
import windData from '../../../data/wind.json';

const vertexShaderSource = `
  attribute vec2 a_pos;
  uniform mat4 u_matrix;
  void main() {
    gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
    gl_PointSize = 1.5;
  }
`;

const fragmentShaderSource = `
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.7);
  }
`;

export const WindLayer = () => {
  const { map } = useMap();

  const windLayer: CustomLayerInterface = useMemo(() => {
    let program: WebGLProgram;
    let buffer: WebGLBuffer;
    let wind: any;
    let particles: number[] = [];

    const NUM_PARTICLES = 5000;

    const buildWind = (data: any) => {
      const u = data[0].data, v = data[1].data;
      return {
        width: data[0].header.nx,
        height: data[0].header.ny,
        uMin: data[0].header.uMin,
        uMax: data[0].header.uMax,
        vMin: data[1].header.vMin,
        vMax: data[1].header.vMax,
        data: (i: number) => [u[i], v[i]],
        interpolate: (x: number, y: number) => {
          const i = Math.floor(x);
          const j = Math.floor(y);
          const fi = x - i;
          const fj = y - j;

          const i0 = Math.min(i, wind.width - 1);
          const j0 = Math.min(j, wind.height - 1);
          const i1 = Math.min(i0 + 1, wind.width - 1);
          const j1 = Math.min(j0 + 1, wind.height - 1);

          const g00 = wind.data(j0 * wind.width + i0);
          const g10 = wind.data(j0 * wind.width + i1);
          const g01 = wind.data(j1 * wind.width + i0);
          const g11 = wind.data(j1 * wind.width + i1);

          const u = (1 - fi) * ((1 - fj) * g00[0] + fj * g01[0]) + fi * ((1 - fj) * g10[0] + fj * g11[0]);
          const v = (1 - fi) * ((1 - fj) * g00[1] + fj * g01[1]) + fi * ((1 - fj) * g10[1] + fj * g11[1]);

          return [u, v];
        }
      };
    };

    const createWind = (gl: WebGLRenderingContext) => {
      const uData = {
        header: { nx: windData.width, ny: windData.height, uMin: windData.uMin, uMax: windData.uMax },
        data: atob(windData.data).split('').map(c => c.charCodeAt(0))
      };
      const vData = { ...uData, header: { ...uData.header, vMin: windData.vMin, vMax: windData.vMax } };
      
      // This is a simplified data loading. In a real app, you'd parse GRIB or a proper format.
      // The provided data string is just a placeholder.
      // For this demo, we'll generate random data instead of parsing the complex string.
      const randomData = [];
      for (let i = 0; i < uData.header.nx * uData.header.ny; i++) {
        randomData.push(Math.random() * (windData.uMax - windData.uMin) + windData.uMin);
        randomData.push(Math.random() * (windData.vMax - windData.vMin) + windData.vMin);
      }

      const u = randomData.filter((_, i) => i % 2 === 0);
      const v = randomData.filter((_, i) => i % 2 !== 0);

      wind = buildWind([{...uData, data: u}, {...vData, data: v}]);
      
      particles = [];
      for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push(Math.random() * 360 - 180, Math.random() * 180 - 90);
      }
      
      buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particles), gl.DYNAMIC_DRAW);
    };

    const evolve = () => {
      if (!wind) return;
      const bounds = map!.getBounds();
      const west = bounds.getWest();
      const east = bounds.getEast();
      const south = bounds.getSouth();
      const north = bounds.getNorth();

      for (let i = 0; i < particles.length; i += 2) {
        const lon = particles[i];
        const lat = particles[i + 1];

        if (lon === undefined || lat === undefined) continue;

        if (lon < west || lon > east || lat < south || lat > north) {
            particles[i] = Math.random() * (east - west) + west;
            particles[i+1] = Math.random() * (north - south) + south;
        }

        const x = (lon + 180) * (wind.width / 360);
        const y = (90 - lat) * (wind.height / 180);
        const v = wind.interpolate(x, y);

        if (v) {
          particles[i] += v[0] * 0.1;
          particles[i + 1] += v[1] * 0.1;
        }
      }
    };

    return {
      id: 'wind-layer',
      type: 'custom',
      renderingMode: '2d',
      onAdd(map, gl) {
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

        createWind(gl);
      },
      render(gl, matrix) {
        gl.useProgram(program);

        gl.uniformMatrix4fv(
          gl.getUniformLocation(program, 'u_matrix')!,
          false,
          matrix,
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        
        evolve();
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(particles));

        const aPos = gl.getAttribLocation(program, 'a_pos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);

        map.triggerRepaint();
      },
    };
  }, [map]);

  useEffect(() => {
    if (!map || map.getLayer('wind-layer')) return;
    map.addLayer(windLayer);

    return () => {
      if (map && map.getLayer('wind-layer')) {
        map.removeLayer('wind-layer');
      }
    };
  }, [map, windLayer]);

  return null;
};