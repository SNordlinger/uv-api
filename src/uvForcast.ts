import { LocalDateTime, DateTimeFormatterBuilder, ZoneId } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";
import "@js-joda/timezone";
import axios from "axios";
import zips from "../data/zips.json";
import tzlookup from "tz-lookup";
import sphereKnn from "sphere-knn";

interface ZipInfo {
  latitude: number;
  longitude: number;
  zipcode: string;
}

interface UVForcastHour {
  datetime: string;
  uv: number;
}

const zipLookup = sphereKnn(Object.values(zips));

function findTimeZone(lat: number, lon: number): ZoneId | null {
  try {
    const timeZone = tzlookup(lat, lon);
    return ZoneId.of(timeZone);
  } catch (e) {
    return null;
  }
}

function parseHourlyData(data: any, timeZone: ZoneId | null): UVForcastHour[] {
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
      datetime: epaToIsoTimestamp(epaDatetime, timeZone),
      uv,
    };
  });
}

function epaToIsoTimestamp(
  epaTimestamp: string,
  timeZone: ZoneId | null
): string {
  const formatter = new DateTimeFormatterBuilder()
    .parseCaseInsensitive()
    .appendPattern("MMM/dd/yyyy hh a")
    .toFormatter()
    .withLocale(Locale.US);
  const localDateTime = LocalDateTime.parse(epaTimestamp, formatter);
  if (timeZone !== null) {
    const zonedDateTime = localDateTime.atZone(timeZone);
    return zonedDateTime.toOffsetDateTime().toString();
  }
  return localDateTime.toString();
}

async function getUVForcast(lat: number, lon: number, zip: string) {
  const endpoint = getZipcodeEndpoint(zip);
  const hourlyResp = await axios.get(endpoint);
  const hourlyEPAData = await hourlyResp.data;
  const timeZone = findTimeZone(lat, lon);
  return parseHourlyData(hourlyEPAData, timeZone);
}

function getZipcodeEndpoint(zipcode: string) {
  return `https://enviro.epa.gov/enviro/efservice/getEnvirofactsUVHOURLY/ZIP/${zipcode}/json`;
}

export function getUVForcastByZipcode(zip: string): Promise<UVForcastHour[]> {
  const location: ZipInfo = zips[zip as keyof typeof zips];
  return getUVForcast(location.latitude, location.longitude, zip);
}

export function getUVForcastByCoords(lat: number, lon: number) {
  const [{ zipcode }] = zipLookup(lat, lon, 1);
  return getUVForcast(lat, lon, zipcode);
}
