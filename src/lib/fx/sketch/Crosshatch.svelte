<script lang="ts">
	import { Pass, useTexture, useThrelte } from '@threlte/core';

	import {
		Color,
		DoubleSide,
		MeshNormalMaterial,
		RawShaderMaterial,
		WebGLRenderTarget
	} from 'three';

	import { ShaderPass, Pass as BasePass } from 'three/addons/postprocessing';
	import { shader as orthoVs } from './shaders/ortho-vs.js';

	import fragmentShader from './shader.js';

	const normalMat = new MeshNormalMaterial({ side: DoubleSide });

	class Crosshatch extends BasePass {
		constructor() {
			super();

			const { renderer } = useThrelte();
			const paperTexture = useTexture('./paper.jpg');

			this.colorFBO = new WebGLRenderTarget();
			this.normalFBO = new WebGLRenderTarget();

			this.renderer = renderer;
			const shader = new RawShaderMaterial({
				uniforms: {
					paperTexture: { value: paperTexture },
					colorTexture: { value: this.colorFBO.texture },
					normalTexture: { value: this.normalFBO.texture },
					inkColor: { value: new Color(100, 100, 0) },
					scale: { value: 0.3 },
					thickness: { value: 2.5 }
				},
				vertexShader: orthoVs,
				fragmentShader
			});
			this.renderPass = new ShaderPass(renderer, shader);
		}

		setSize(w, h) {
			this.normalFBO.setSize(w, h);
			this.colorFBO.setSize(w, h);
			this.renderPass.setSize(w, h);
		}

		render(scene, camera) {
			this.renderer.setRenderTarget(this.colorFBO);
			this.renderer.render(scene, camera);
			this.renderer.setRenderTarget(null);
			scene.overrideMaterial = normalMat;
			this.renderer.setRenderTarget(this.normalFBO);
			this.renderer.render(scene, camera);
			this.renderer.setRenderTarget(null);
			scene.overrideMaterial = null;
			this.renderPass.render(true);
		}
	}

	const pass = new Crosshatch();
</script>

<Pass {pass} />
