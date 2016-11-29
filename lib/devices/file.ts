import * as fs from 'mz/fs';
import * as node from './node';
import * as generic from './generic';
import { Reader } from '../reader';
import { Writer } from '../writer';
import { wait } from 'f-promise';

/// !doc
/// ## File based EZ streams
/// 
/// `import * as f from 'f-streams'`
/// 
export const text = {
	/// * `reader = ez.devices.file.text.reader(path, encoding)`  
	///   creates an EZ reader that reads from a text file.    
	///   `encoding` is optional. It defaults to `'utf8'`.  
	reader(path: string, encoding?: string): Reader<string> {
		return node.reader(fs.createReadStream(path, {
			encoding: encoding || 'utf8'
		}));
	},
	/// * `writer = ez.devices.file.text.writer(path, encoding)`  
	///   creates an EZ writer that writes to a text file.    
	///   `encoding` is optional. It defaults to `'utf8'`.  
	writer(path: string, encoding?: string): Writer<string> {
		return node.writer(fs.createWriteStream(path, {
			encoding: encoding || 'utf8'
		}));
	}
}

export const binary = {
	/// * `reader = ez.devices.file.binary.reader(path)`  
	///   creates an EZ reader that reads from a binary file.    
	reader(path: string): Reader<Buffer> {
		return node.reader(fs.createReadStream(path));
	},
	/// * `writer = ez.devices.file.binary.writer(path)`  
	///   creates an EZ writer that writes to a binary file.    
	writer(path: string): Writer<Buffer> {
		return node.writer(fs.createWriteStream(path));
	}
}

/// * `reader = ez.devices.file.list(path, options)`  
///   `reader = ez.devices.file.list(path, recurse, accept)`  
///   creates a reader that enumerates (recursively) directories and files.  
///   Returns the entries as `{ path: path, name: name, depth: depth, stat: stat }` objects.  
///   Two `options` may be specified: `recurse` and `accept`.  
///   If `recurse` is falsy, only the entries immediately under `path` are returned.  
///   If `recurse` is truthy, entries at all levels (including the root entry) are returned.  
///   If `recurse` is `"postorder"`, directories are returned after their children.  
///   `accept` is an optional function which will be called as `accept(entry)` and 
///   will control whether files or subdirectories will be included in the stream or not.  
export interface ListOptions {
	recurse?: boolean | 'preorder' | 'postorder';
	accept?: (entry: ListEntry) => boolean;
}

export interface ListEntry {
	path: string;
	name: string;
	depth: number;
	stat: fs.Stats;
}

export function list(path: string, options?: ListOptions) {
	var recurse: boolean | 'preorder' | 'postorder', accept: ((entry: ListEntry) => boolean) | undefined;
	if (options && typeof options === 'object') {
		recurse = options.recurse || false;
		accept = options.accept;
	} else {
		recurse = arguments[1];
		accept = arguments[2];
	}
	const postorder = recurse === 'postorder';
	return generic.empty.reader.transform((reader, writer) => {
		function process(p: string, name: string, depth: number) {
			const stat = wait(fs.stat(p));
			const entry = {
				path: p,
				name: name,
				depth: depth,
				stat: stat,
			};
			if (accept && !accept(entry)) return;
			if ((recurse || depth === 1) && !postorder) writer.write(entry);
			if ((recurse || depth === 0) && stat.isDirectory()) wait(fs.readdir(p)).forEach(pp => {
				process(p + '/' + pp, pp, depth + 1);
			});
			if ((recurse || depth === 1) && postorder) writer.write(entry);
		}
		process(path, path.substring(path.lastIndexOf('/') + 1), 0);
	});
}