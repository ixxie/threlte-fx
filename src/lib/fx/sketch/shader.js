import { shader as sobel } from './shaders/sobel.js';
import { shader as aastep } from './shaders/aastep.js';
import { shader as luma } from './shaders/luma.js';
import { shader as darken } from './shaders/blend-darken.js';

export default `#version 300 es
		precision highp float;
		uniform sampler2D colorTexture;
		uniform sampler2D normalTexture;
		uniform sampler2D paperTexture;
		uniform vec3 inkColor;
		uniform float scale;
		uniform float thickness;
		out vec4 fragColor;
		in vec2 vUv;
		${sobel}
		${luma}
		float texh(in vec2 p, in float lum) {
		  float e = thickness * length(vec2(dFdx(p.x), dFdy(p.y))); 
		  if (lum < 1.00) {
		    float v = abs(mod(p.x + p.y, 10.0));
		    if (v < e) {
		      return 0.;
		    }
		  }

		  if (lum < 0.8) {
		    float v = abs(mod(p.x - p.y, 10.0));
		    if (v < e) {
		      return 0.;
		    }
		  }

		  if (lum < 0.6) {
		    float v = abs(mod(p.x + p.y - 5.0, 10.0));
		    if (v < e) {
		      return 0.;
		    }
		  }

		  if (lum < 0.4) {
		    float v = abs(mod(p.x - p.y - 5.0, 10.0));
		    if (v < e) {
		      return 0.;
		    }
		  }
		  if (lum < 0.2) {
		    float v = abs(mod(p.x + p.y - 7.5, 10.0));
		    if (v < e) {
		      return 0.;
		    }
		  }
		 return 1.;
		}
		${aastep}
		${darken}
		void main() {
		  vec2 size = vec2(textureSize(colorTexture, 0));
		  float e = .01;
		  vec4 color = texture(colorTexture, vUv);
		  float l = 2. * luma(color.rgb);
		  float normalEdge = 1.- length(sobel(normalTexture, vUv, size, thickness));
		  normalEdge = aastep(.5, normalEdge);
		  // float colorEdge = 1.- length(sobel(colorTexture, vUv, size, 1.));
		  // colorEdge = aastep(.5, colorEdge);
		  // colorEdge += .5;
		  vec4 paper = texture(paperTexture, .00025 * vUv*size);
		  float r = texh(scale*vUv*size, l) * normalEdge;
		  fragColor.rgb = blendDarken(paper.rgb, inkColor/255., 1.-r);
		  fragColor.a = 1.;
		}
	`;
