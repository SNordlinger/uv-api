import fastify from 'fastify';
import { getUVForcastByZipcode } from './uvForcast';

const server = fastify();

interface ZipCodeParams {
  zipcode: string;
}

server.get<{ Params: ZipCodeParams }>('/zipcode/:zipcode', async (req, res) => {
  const zipCode = req.params.zipcode;
  const forcast = await getUVForcastByZipcode(zipCode);
  res.send(forcast);
});

server.listen(8080, "0.0.0.0", (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is listening at ${address}`);
});
