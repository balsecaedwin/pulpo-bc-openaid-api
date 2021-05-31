import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { Configuration } from 'webpack';
import { yamlParse } from 'yaml-cfn';
import * as path from 'path';

/** Custom Interface for YAML Template Function Property */
interface ISamFunction {
  Type: string;
  Properties: {
    CodeUri?: string;
    Handler: string;
    Description?: string;
    Events?: EventSource;
    Environment?: {
      Variables: {
        [key: string]: string;
      };
    };
    FunctionName?: string;
    Layers?: { [Ref: string]: string }[];
    Runtime?: string;
    Timeout?: number;
    Tracing?: string;
    VersionDescription?: string;
  };
}

const { Globals, Resources } = yamlParse(readFileSync(join(__dirname, 'template.yaml'), 'utf-8'));
const GlobalFunction = Globals?.Function ?? {};
const handlerPath = './src/handlers';

const entries = Object.values(Resources)
  .filter((resource: ISamFunction) => resource.Type === 'AWS::Serverless::Function')
  .filter((resource: ISamFunction) => (resource.Properties?.Runtime ?? GlobalFunction.Runtime).startsWith('nodejs'))
  .map((resource: ISamFunction) => ({
    filename: resource.Properties.Handler.split('.')[0],
    entryPath: resource.Properties.CodeUri.split('/').splice(1).join('/'),
  }))
  .reduce(
    (resources, resource) =>
      Object.assign(resources, {
        [`${resource.entryPath}/${resource.filename}`]: `${handlerPath}/${resource.filename}.ts`,
      }),
    {},
  );

const config: Configuration = {
  entry: entries,
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: resolve(__dirname, 'build'),
  },
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.ts', '.js'],
    alias: {
      '@interfaces': 'interfaces',
      '@services': 'services',
    },
  },
  target: 'node',
};

export default config;
