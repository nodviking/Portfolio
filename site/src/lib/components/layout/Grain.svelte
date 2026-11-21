<!-- Film grain: a tiny SVG turbulence tile, stepped around so it shimmers. Static under reduced motion. -->
<div class="grain" aria-hidden="true"></div>

<style>
	.grain {
		position: fixed;
		inset: -50%;
		z-index: 90;
		pointer-events: none;
		opacity: 0.04;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1.4 -0.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		animation: grain 0.9s steps(6) infinite;
	}
	@keyframes grain {
		0% {
			transform: translate(0, 0);
		}
		20% {
			transform: translate(-6%, 4%);
		}
		40% {
			transform: translate(5%, -7%);
		}
		60% {
			transform: translate(-3%, 8%);
		}
		80% {
			transform: translate(7%, -2%);
		}
		100% {
			transform: translate(0, 0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.grain {
			animation: none;
		}
	}
</style>
