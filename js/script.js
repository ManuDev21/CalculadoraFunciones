// Configuración de particles.js (fondo interactivo)
particlesJS("particles-js", {
    "particles": {
      "number": {
        "value": 80,
        "density": { "enable": true, "value_area": 800 }
      },
      "color": { "value": "#ffffff" },
      "shape": {
        "type": "circle",
        "stroke": { "width": 0, "color": "#000000" },
        "polygon": { "nb_sides": 5 }
      },
      "opacity": {
        "value": 0.5,
        "random": false,
        "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false }
      },
      "size": {
        "value": 3,
        "random": true,
        "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false }
      },
      "line_linked": {
        "enable": true,
        "distance": 150,
        "color": "#ffffff",
        "opacity": 0.4,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 6,
        "direction": "none",
        "random": false,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": { "enable": true, "mode": "repulse" },
        "onclick": { "enable": true, "mode": "push" },
        "resize": true
      },
      "modes": {
        "grab": { "distance": 400, "line_linked": { "opacity": 1 } },
        "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 },
        "repulse": { "distance": 200 },
        "push": { "particles_nb": 4 },
        "remove": { "particles_nb": 2 }
      }
    },
    "retina_detect": true
  });  
  $(document).ready(function() {

    $('#calcForm').on('submit', function(e) {
      e.preventDefault();
      
      // Obtener los valores de los inputs
      let exprStr    = $('#funcionInput').val();
      let opcion     = $('#opcionSelect').val();
      let valorInput = $('#valorInput').val();
      let valor      = parseFloat(valorInput);
      let result     = "";
      
      if(exprStr.trim() === "") {
        Swal.fire('Error', 'Por favor, ingresa una función.', 'error');
        return;
      }
      
      try {
        if(opcion === "funcion") {
          // Evaluar la función en x = valor usando math.js
          if(isNaN(valor)) {
            Swal.fire('Error', 'Debes ingresar un valor numérico para evaluar la función.', 'error');
            return;
          }
          let f = math.compile(exprStr);
          result = f.evaluate({x: valor}).toString();
          
          // Graficar la función original
          plotFunction(exprStr, valor);
          
        } else if(opcion === "derivada") {
          // Calcular la derivada usando math.js
          let deriv = math.derivative(exprStr, 'x');
          let derivStr = deriv.toString();
          // Simplificar la derivada (math.js tiene un método simplify)
          let derivSimpl = math.simplify(derivStr).toString();
          result = "<strong>Derivada:</strong> " + derivStr + "<br><br>" +
                   "<strong>Derivada Simplificada:</strong> " + derivSimpl;
          
          // Graficar la derivada (usando la versión simplificada para evaluar)
          plotFunction(derivSimpl, null);
          
        } else if(opcion === "integral") {
          // Para la integral usaremos una aproximación numérica (definida como ∫[0,x] f(t) dt)
          if(isNaN(valor)) {
            Swal.fire('Error', 'Debes ingresar un valor numérico para evaluar la integral.', 'error');
            return;
          }
          let f = math.compile(exprStr);
          // Calcular la integral definida desde 0 hasta el valor ingresado
          let integralValue = numericalIntegral(function(t) {
            return f.evaluate({x: t});
          }, 0, valor, 1000);
          result = "<strong>Integral definida de f(x) en [0, " + valor + "]:</strong> " + integralValue;
          
          // Graficar la función integral (definida como I(x) = ∫[0,x] f(t) dt)
          plotFunctionIntegral(exprStr);
          
        } else if(opcion === "limite") {
          // Aproximación numérica del límite evaluando en puntos cercanos
          if(isNaN(valor)) {
            Swal.fire('Error', 'Debes ingresar un valor numérico para calcular el límite.', 'error');
            return;
          }
          let f = math.compile(exprStr);
          let rightValues = [];
          let leftValues  = [];
          for(let i = 1; i <= 5; i++){
            let delta = Math.pow(10, -i);
            rightValues.push(f.evaluate({x: valor + delta}));
            leftValues.push(f.evaluate({x: valor - delta}));
          }
          result = "Aproximación: Límite por la derecha ~ " + rightValues[4] +
                   ", Límite por la izquierda ~ " + leftValues[4];
          
          // Opcional: se puede calcular un rango aproximado evaluando en [-10,10]
          let xVals = math.range(-10, 10, 0.1, true).toArray();
          let yVals = xVals.map(x => f.evaluate({x: x}));
          let yMin  = Math.min(...yVals);
          let yMax  = Math.max(...yVals);
          let rangeApprox = "[" + yMin.toFixed(2) + ", " + yMax.toFixed(2) + "]";
          result += "<br>Rango aproximado en [-10,10]: " + rangeApprox;
          
          // Graficar la función original para visualizar el comportamiento en el límite
          plotFunction(exprStr, valor);
        }
        
    $('#limpiarBtn').click(function(){
        $('#funcionInput').val('');
        $('#valorInput').val('');
        $('#opcionSelect').prop('selectedIndex', 0);
        $('#plot').html('');
      });
        
        // Mostrar el resultado usando SweetAlert2
        Swal.fire({
          title: 'Resultado',
          html: result,
          icon: 'info'
        });
        
      } catch (error) {
        Swal.fire('Error', error.toString(), 'error');
      }
    });

    // Función para graficar una expresión (para función, derivada, y límite)
    function plotFunction(exprStr, marcarValor) {
      let f;
      try {
        f = math.compile(exprStr);
      } catch(err) {
        Swal.fire('Error', err.toString(), 'error');
        return;
      }
      
      let xValues = math.range(-10, 10, 0.1, true).toArray();
      let yValues = xValues.map(function(x) {
        try {
          let y = f.evaluate({x: x});
          return (isNaN(y) || !isFinite(y)) ? null : y;
        } catch(e) {
          return null;
        }
      });
      
      let filteredData = xValues.map((x, i) => ({ x: x, y: yValues[i] }))
                                .filter(pt => pt.y !== null);
      let xPlot = filteredData.map(pt => pt.x);
      let yPlot = filteredData.map(pt => pt.y);
      
      let data = [{
        x: xPlot,
        y: yPlot,
        mode: 'lines',
        line: { color: 'magenta', width: 2 },
        name: 'f(x)'
      }];
      
      if(marcarValor !== null) {
        let yMark;
        try {
          yMark = f.evaluate({x: marcarValor});
        } catch(e) {
          yMark = 0;
        }
        data.push({
          x: [marcarValor],
          y: [yMark],
          mode: 'markers',
          marker: { color: 'yellow', size: 10 },
          name: 'Punto evaluado'
        });
      }
      
      let layout = {
        height: 600,
        margin: { t: 50, b: 50, l: 50, r: 50 },
        paper_bgcolor: "#111",
        plot_bgcolor: "#111",
        font: { color: "#fff" },
        title: 'Gráfica de la función',
        xaxis: { title: 'x' },
        yaxis: { title: 'f(x)' }
      };
      
      Plotly.newPlot('plot', data, layout, {responsive: true});
    }
    
    // Función de integración numérica (regla del trapecio)
    function numericalIntegral(func, a, b, n) {
      n = n || 1000;
      let h = (b - a) / n;
      let sum = 0.5 * (func(a) + func(b));
      for (let i = 1; i < n; i++) {
        sum += func(a + i * h);
      }
      return sum * h;
    }
    
    // Función para graficar la integral definida: I(x) = ∫[0,x] f(t) dt
    function plotFunctionIntegral(exprStr) {
      let f = math.compile(exprStr);
      let xValues = math.range(-10, 10, 0.1, true).toArray();
      let yValues = xValues.map(function(x) {
        return numericalIntegral(function(t) {
          return f.evaluate({x: t});
        }, 0, x, 1000);
      });
      
      let data = [{
        x: xValues,
        y: yValues,
        mode: 'lines',
        line: { color: 'magenta', width: 2 },
        name: 'Integral de f(x)'
      }];
      
      let layout = {
        height: 600,
        margin: { t: 50, b: 50, l: 30, r: 50 },
        paper_bgcolor: "#111",
        plot_bgcolor: "#111",
        font: { color: "#fff" },
        title: 'Gráfica de la Integral de la función',
        xaxis: { title: 'x' },
        yaxis: { title: 'Integral de f(x)' }
      };
      
      Plotly.newPlot('plot', data, layout, {responsive: true});
    }
    
  });