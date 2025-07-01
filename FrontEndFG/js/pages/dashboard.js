// Esta función contiene toda la lógica de los gráficos para el dashboard.
function init() {
  console.log("Módulo del Dashboard cargado. Inicializando gráficos...");

  var salesOverviewOptions = {
    series: [{
      name: "Ample Admin",
      data: [355, 390, 300, 350, 390, 180, 355, 390]
    }, {
      name: "Pixel Admin",
      data: [280, 250, 325, 215, 250, 310, 280, 250]
    }],
    chart: {
      height: 350,
      type: 'bar',
      fontFamily: "Plus Jakarta Sans,sans-serif",
      foreColor: "#adb0bb",
      toolbar: { show: false },
    },
    // ...otras opciones...
  };
  
  // Es importante que el elemento #sales-overview ya exista en el DOM cuando esto se ejecute.
  const chartElement = document.querySelector("#sales-overview");
  if (chartElement) {
    var chart = new ApexCharts(chartElement, salesOverviewOptions);
    chart.render();
  } else {
    console.error("No se encontró el elemento #sales-overview para renderizar el gráfico.");
  }
}

// Exportamos la función para que main.js pueda importarla y llamarla.
export { init };