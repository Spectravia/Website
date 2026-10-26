<script setup lang="ts">
/**
 * Decorative brand visual: a beam of light entering the Spectravia prism and
 * splitting into the spectrum. Pure SVG; colours and animation live in hero.css.
 */
const colors = ['violet', 'blue', 'cyan', 'green', 'yellow', 'red'] as const

/**
 * Each ray starts as a thin slice on the prism face and fans out to the right edge.
 * `pulse` is the ray's centre line, along which a pulse of light travels.
 */
const rays = colors.map((color, i) => {
  const startTop = 286 + i * 6
  const endTop = -40 + i * 115
  return {
    color,
    points: `548,${startTop} 548,${startTop + 6} 900,${endTop + 95} 900,${endTop}`,
    pulse: { x1: 548, y1: startTop + 3, x2: 900, y2: endTop + 47 },
  }
})
</script>

<template>
  <svg
    class="prism"
    viewBox="0 0 900 600"
    preserveAspectRatio="xMaxYMid slice"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient
        id="prism-in"
        x1="0"
        x2="1"
      >
        <stop
          offset="0"
          stop-color="#fff"
          stop-opacity="0"
        />
        <stop
          offset="1"
          stop-color="#fff"
          stop-opacity=".9"
        />
      </linearGradient>
      <linearGradient
        v-for="ray in rays"
        :id="`prism-${ray.color}`"
        :key="ray.color"
        x1="0"
        x2="1"
      >
        <stop
          offset="0"
          :class="`prism__stop prism__stop--${ray.color}`"
        />
        <stop
          offset="1"
          :class="`prism__stop prism__stop--${ray.color}`"
          stop-opacity="0"
        />
      </linearGradient>
      <filter
        id="prism-blur"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
      >
        <feGaussianBlur stdDeviation="8" />
      </filter>
    </defs>

    <!-- incoming white light -->
    <polygon
      class="prism__in"
      points="120,360 120,364 470,302 470,298"
      fill="url(#prism-in)"
    />
    <line
      class="prism__pulse-in"
      x1="120"
      y1="362"
      x2="470"
      y2="300"
    />

    <!-- spectrum fan (blurred glow + crisp layer) -->
    <g
      class="prism__fan prism__fan--glow"
      filter="url(#prism-blur)"
    >
      <polygon
        v-for="ray in rays"
        :key="ray.color"
        :points="ray.points"
        :fill="`url(#prism-${ray.color})`"
      />
    </g>
    <g class="prism__fan">
      <polygon
        v-for="(ray, i) in rays"
        :key="ray.color"
        :class="`prism__ray prism__ray--${i + 1}`"
        :points="ray.points"
        :fill="`url(#prism-${ray.color})`"
      />
    </g>

    <!-- pulses of light leaving the prism along each ray -->
    <g class="prism__pulses">
      <line
        v-for="(ray, i) in rays"
        :key="ray.color"
        :class="`prism__pulse prism__pulse--${ray.color} prism__pulse--${i + 1}`"
        v-bind="ray.pulse"
      />
    </g>

    <!-- prism -->
    <path
      d="M400 430 L510 210 L620 430 Z"
      class="prism__glow"
      filter="url(#prism-blur)"
    />
    <path
      d="M400 430 L510 210 L620 430 Z"
      class="prism__edge"
    />
    <circle
      cx="400"
      cy="430"
      r="7"
      class="prism__dot"
    />
  </svg>
</template>
