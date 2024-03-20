export function useHelpers() {
  const getCurrentDate = () => {
    const date = new Date();

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (month < 10) {
      return `${day}-0${month}-${year}`
    } else {
      return `${day}-${month}-${year}`
    }
  };

  // Formatear fecha
  function formatDate(date, format) {
    date = new Date(date);
    const day = date.getDate() + 1;
    const month = date.getMonth() + 1; // Months are zero-based
    const year = date.getFullYear();

    const formattedDate = format
      .toLowerCase()
      .replace("dddd", date.toLocaleString("es-PE", { weekday: "long" }))
      .replace("ddd", date.toLocaleString("es-PE", { weekday: "short" }))
      .replace("dd", ("0" + day).slice(-2))
      .replace("mmmm", date.toLocaleString("es-PE", { month: "long" }))
      .replace("mmm", date.toLocaleString("es-PE", { month: "short" }))
      .replace("mm", ("0" + month).slice(-2))
      .replace("yyyy", year)
      .replace("yy", year.toString().substr(-2));

    return formattedDate;
  }

  // Formatear hora
  function formatTime(time, format, use24HourFormat = false) {
    const date = new Date(time);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    // Aplicar formato de 12 horas si se especifica
    if (!use24HourFormat) {
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      format = format.replace("A", ampm);
    }

    // Agregar ceros iniciales si es necesario
    hours = hours.toString().padStart(2, "0");
    minutes = minutes.toString().padStart(2, "0");
    seconds = seconds.toString().padStart(2, "0");

    // Reemplazar tokens de formato con valores
    const formattedTime = format
      .toLowerCase()
      .replace("hh", hours)
      .replace("mm", minutes)
      .replace("ss", seconds);

    return formattedTime;
  }

  // Convertir hora a segundos
  function convertHourToSeconds(hour) {
    const hourParts = hour.split(":");
    const hours = parseInt(hourParts[0], 10);
    const minutes = parseInt(hourParts[1], 10);
    const seconds = parseInt(hourParts[2], 10);

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    return totalSeconds;
  }

  return { getCurrentDate, formatDate, formatTime, convertHourToSeconds };
}
