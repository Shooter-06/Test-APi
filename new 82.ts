// how can we make the pathOverides parse an Id to be reolved in our service so that the URL we 
// get the id and return the right route. I don't want to ge the error of undefined on the id part in our pathOverides  

import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InMemoryDbService, InMemoryBackendConfig, RequestInfo, RequestInfoUtilities, ParsedRequestUrl } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';

export const inMemoryBackendConfig: InMemoryBackendConfig = {
  delay: 100,
  dataEncapsulation: false,
  passThruUnknownUrl: true,
  caseSensitiveSearch: false,
};

export interface InMemoryDb {
  adminPortalSites: any;
  contentSections: any;
  contentItems: any;
}

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  pathOverrides: Map<string, keyof InMemoryDb> = new Map();
  siteId?: number;
  contentSectionId?: number;
  portalSiteId?: number;

  constructor(private route: ActivatedRoute) {
    this.pathOverrides.set('admin/sites', 'adminPortalSites');

    this.pathOverrides.set(`admin/sites/{portalSiteId}/content-sections`, 'contentSections');
  }

  createDb(): Promise<InMemoryDb> {
    return Promise.all([
      this.fetchJson('/fake-data/sites.json'),
      this.fetchJson('/fake-data/content-sections.json'),
      this.fetchJson('/fake-data/content-items.json'),
    ]).then(([adminPortalSites, contentSections, contentItems]) => {
      return { adminPortalSites, contentSections, contentItems };
    });
  }

  parseRequestUrl(url: string, utils: RequestInfoUtilities): ParsedRequestUrl {
    const apiBase = utils.getConfig().apiBase ?? '';
  
    for (const [path, pathOverride] of this.pathOverrides) {
      const pathPrefix = `${apiBase}${path ? '/' : ''}`;
      
      if (url.startsWith(pathPrefix)) {
        // Extract potential ID from the URL
        const idPattern = /{(\w+)}/;
        const match = path.match(idPattern);
        
        if (match) {
          const idPlaceholder = match[0];
          const idKey = match[1];
          const idValue = this.extractIdFromUrl(url, pathPrefix);
          
          // Store ID value to a property based on its key
          this[idKey] = idValue;
  
          // Replace placeholder with actual ID in the path override
          const newPath = path.replace(idPattern, idValue);
          url = `${apiBase}/${pathOverride}${url.substring(newPath.length)}`;
        } else {
          url = `${apiBase}/${pathOverride}${url.substring(pathPrefix.length)}`;
        }
        
        break;
      }
    }
  
    const parsedUrl = utils.parseRequestUrl(url); // fixed from utils.ParsedRequestUrl(url)
    return parsedUrl;
  }
  
  // Helper method to extract ID from the URL based on the prefix
  private extractIdFromUrl(url: string, prefix: string): string {
    const prefixedUrl = url.substring(prefix.length);
    const idEndIndex = prefixedUrl.indexOf('/');
    return idEndIndex === -1 ? prefixedUrl : prefixedUrl.substring(0, idEndIndex);
  }
  

  get(requestInfo: RequestInfo): Observable<any> | undefined {
    const query = requestInfo.query;

    switch (requestInfo.collectionName) {
      // Add your case statements here to handle various collection names
      default:
        return undefined;
    }
  }

  private fetchJson<T>(url: string): Promise<T> {
    return fetch(url)
      .then((response) => response.json())
      .then((value) => value as T);
    // .catch((error) => console.error('Error in fetchJson:', error));
  }

  // Create a custom response based on the request info and data
  private createCustomResponse(requestInfo: RequestInfo, data: any): Observable<any> {
    const dataEncapsulation = requestInfo.utils.getConfig().dataEncapsulation;

    // Create the response
    return requestInfo.utils.createResponse(() => {
      const options: ResponseOptions = {
        body: dataEncapsulation ? { data } : data,
        status: 200,
      };

      return this.finishOptions(options, requestInfo);
    });
  }

  // Finish the response options and return
  private finishOptions(options: ResponseOptions, requestInfo: RequestInfo): ResponseOptions {
    options.statusText = options.status ? 'OK' : undefined;
    options.headers = requestInfo.headers;
    options.url = requestInfo.url;

    return options;
  }


}
