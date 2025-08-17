/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Converts HTML to Markdown.
 * @param html The HTML to convert.
 * @param contentUrl The URL of the content.
 * @returns The Markdown.
 */
export declare function toMarkdown(html: string, contentUrl: URL): Promise<string>;
export declare function toAbsoluteUrl(url: string, contentUrl: URL): string;
//# sourceMappingURL=utils.d.ts.map