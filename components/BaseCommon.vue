<script>
export default {
  methods: {
    convRgba(color, alpha = 0.5) {
      const rgba = {
        r: parseInt(color.slice(1, 3), 16),
        g: parseInt(color.slice(3, 5), 16),
        b: parseInt(color.slice(5, 7), 16),
        a: alpha
      }
      return `rgba(${Object.values(rgba).join(',')})`
    }
  }
}
</script>
