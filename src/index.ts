import fastify from "fastify";
import fastifyCors from "fastify-cors";
import { getUVForcastByZipcode, getUVForcastByCoords } from "./uvForcast";

const server = fastify();

let origin: string;
if (process.env.NODE_ENV === "production") {
  origin = "https://uv.samnordlinger.com";
} else {
  origin = "*";
}

server.register(fastifyCors, {
  origin,
});

interface ZipCodeParams {
  zipcode: string;
}

interface LatLonParams {
  coords: string;
}

server.get<{ Params: ZipCodeParams }>("/zipcode/:zipcode", async (req, res) => {
  const zipCode = req.params.zipcode;
  const forcast = await getUVForcastByZipcode(zipCode);
  res.send(forcast);
});

server.get<{ Params: LatLonParams }>("/latlon/:coords", async (req, res) => {
  const coords = req.params.coords;
  const matches = coords.match(/(-?[0-9]+\.?[0-9]*),(-?[0-9]+\.?[0-9]*)/);
  if (matches === null) {
    res.status(400);
    return;
  }

  const [_, latStr, lonStr] = matches;
  const lat = Number.parseFloat(latStr);
  const lon = Number.parseFloat(lonStr);
  const forcast = await getUVForcastByCoords(lat, lon);
  res.send(forcast);
});

server.listen(8080, "0.0.0.0", (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is listening at ${address}`);
});
