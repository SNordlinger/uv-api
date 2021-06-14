import { LocalDateTime, DateTimeFormatterBuilder } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";
import axios from "axios";

interface UVForcastHour {
  datetime: LocalDateTime;
  uv: number;
}

function parseHourlyData(data: any): UVForcastHour[] {
  if (!Array.isArray(data)) {
    throw new Error("EPA data is not in array form");
  }

  return data.map((hour: any) => {
    const epaDatetime = hour.DATE_TIME;
    const uv: number = hour.UV_VALUE;
    if (epaDatetime === undefined || uv === undefined) {
      throw new Error("Incomplete EPA data");
    }

    return {
      datetime: epaToLocalDateTime(epaDatetime),
      uv,
    };
  });
}

function epaToLocalDateTime(epaTimestamp: string) {
  const formatter = new DateTimeFormatterBuilder()
    .parseCaseInsensitive()
    .appendPattern("MMM/dd/yyyy hh a")
    .toFormatter()
    .withLocale(Locale.US);
  const datetime = LocalDateTime.parse(epaTimestamp, formatter);
  return datetime
}

export async function getUVForcastByZipcode(
  zip: string
): Promise<UVForcastHour[]> {
  const endpoint = getZipcodeEndpoint(zip);
  const hourlyResp = await axios.get(endpoint);
  const hourlyEPAData = await hourlyResp.data;
  return parseHourlyData(hourlyEPAData);
}

function getZipcodeEndpoint(zipcode: string) {
  return `https://enviro.epa.gov/enviro/efservice/getEnvirofactsUVHOURLY/ZIP/${zipcode}/json`;
}
