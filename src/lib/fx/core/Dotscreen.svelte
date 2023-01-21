<script lang="ts">
	import { Pass } from '@threlte/core';

	import { DotScreenPass } from 'three/addons/postprocessing/DotScreenPass';
</script>

<Pass pass={new DotScreenPass()} />
