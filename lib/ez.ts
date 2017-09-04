import * as devices from './devices/index';
import * as helpers from './helpers/index';
import * as mappers from './mappers/index';
import * as predicate from './predicate';
import * as stopException from './stop-exception';
import * as transforms from './transforms/index';

import EzFactory from './factory';
import * as EzReader from './reader';
import * as EzWriter from './writer';

export {
	devices, helpers, mappers, transforms,
	predicate, stopException,
};

export const factory = EzFactory;

export type Reader<T> = EzReader.Reader<T>;
export type CompareOptions<T> = EzReader.CompareOptions<T>;
export type ParallelOptions = EzReader.ParallelOptions;

export type Writer<T> = EzWriter.Writer<T>;

export function reader(arg: string | any[] | Buffer): Reader<any> {
	if (typeof arg === 'string') {
		const f = factory(arg);
		let rd: Reader<any>;
		return devices.generic.reader(function read() {
			if (!rd) rd = f.reader();
			return rd.read();
		}, function stop(aarg) {
			if (!rd) rd = f.reader();
			return rd.stop(aarg);
		});
	} else if (Array.isArray(arg)) {
		return devices.array.reader(arg);
	} else if (Buffer.isBuffer(arg)) {
		return devices.buffer.reader(arg);
	} else {
		throw new Error(`invalid argument ${arg && typeof arg}`);
	}
}

export function writer(arg: string | any[] | Buffer): Writer<any> {
	if (typeof arg === 'string') {
		const f = factory(arg);
		let wr: Writer<any>;
		const wrapper = devices.generic.writer(function write(val) {
			if (!wr) wr = f.writer();
			return wr.write(val);
		}, function stop(aarg) {
			if (!wr) wr = f.writer();
			return wr.stop(aarg);
		});
		Object.defineProperty(wrapper, 'result', {
			get: () => {
				const anyWriter: any = wr;
				return anyWriter.result;
			},
		});
		return wrapper;
	} else if (Array.isArray(arg)) {
		// warning: arg is ignored here
		return devices.array.writer();
	} else if (Buffer.isBuffer(arg)) {
		// warning: arg is ignored here
		return devices.buffer.writer();
	} else {
		throw new Error(`invalid argument ${arg && typeof arg}`);
	}
}

// compatibility hacks
function anyfy(x: any) { return x; }
const readerHack: any = reader;
readerHack.create = EzReader.create;
readerHack.decorate = anyfy(EzReader).decorate;

const writerHack: any = writer;
writerHack.create = EzWriter.create;
writerHack.decorate = anyfy(EzWriter).decorate;

const transformHack: any = transforms.cut.transform;
(transforms as any).cut = transformHack;
transforms.cut.transform = transformHack;

const queueHack: any = devices.queue.create;
(devices as any).queue = queueHack;
devices.queue.create = queueHack;

// more practical imports for devices
export {
	Options as ArrayOptions,
	reader as arrayReader,
	writer as arrayWriter,
} from './devices/array';

export {
	Options as BufferOptions,
	reader as bufferReader,
	writer as bufferWriter,
} from './devices/buffer';

export {
	reader as childProcessReader,
	ReaderOptions as ChildProcessReaderOptions,
	writer as childProcessWriter,
	WriterOptions as ChildProcessWriterOptions,
} from './devices/child-process';

export {
	error as consoleError,
	info as consoleInfo,
	log as consoleLog,
	warn as consoleWarn,
} from './devices/console';

export {
	reader as genericReader,
	writer as genericWriter,
} from './devices/generic';

export {
	HttpProxyClientRequest,
	HttpClientRequest,
	HttpClientResponse,
	HttpClientOptions,
	HttpServer,
	HttpServerRequest,
	HttpServerResponse,
	HttpServerOptions,
	server as httpServer,
	client as httpClient,
	listener as httpListener,
} from './devices/http';

export {
	SocketOptions,
	SocketClient,
	SocketServerOptions,
	SocketServerListener,
	SocketServer,
	server as socketServer,
	socketClient,
	tcpClient,
} from './devices/net';

export {
	reader as nodeReader,
	writer as nodeWriter,
} from './devices/node';

export {
	input as stdInput,
	output as stdOutput,
	error as stdError,
} from './devices/std';

export {
	Options as StringOptions,
	reader as stringReader,
	writer as stringWriter,
} from './devices/string';

export {
	ReaderOptions as BinaryReaderOptions,
	WriterOptions as BinaryWriterOptions,
	reader as binaryReader,
	writer as binaryWriter,
} from './helpers/binary';

export {
	stringify as stringConverter,
	bufferify as bufferConverter,
} from './mappers/convert';

export {
	ParserOptions as JsonParserOptions,
	FormatterOptions as jsonFormatterOptions,
	parse as jsonParser,
	stringify as jsonFormatter,
} from './mappers/json';

export {
	ParserOptions as CsvParserOptions,
	FormatterOptions as CsvFormatterOptions,
	parser as csvParser,
	formatter as csvFormatter,
} from './transforms/csv';

export {
	ParserOptions as JsonTransformParserOptions,
	FormatterOptions as JsonTransformFormatterOptions,
	parser as jsonTransformParser,
	formatter as jsonTransformFormatter,
} from './transforms/json';

export {
	ParserOptions as LinesParserOptions,
	FormatterOptions as LinesFormatterOptions,
	parser as linesParser,
	formatter as linesFormatter,
} from './transforms/csv';

export {
	transform as cutter,
} from './transforms/cut';

export {
	ParserOptions as MultipartParserOptions,
	FormatterOptions as MultipartFormatterOptions,
	parser as multipartParser,
	formatter as multipartFormatter,
} from './transforms/multipart';

export {
	ParserOptions as XmlParserOptions,
	FormatterOptions as XmlFormatterOptions,
	parser as xmlParser,
	formatter as xmlFormatter,
} from './transforms/xml';
