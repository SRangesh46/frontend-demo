import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(prodValue: any, searchText: any): any {
    return prodValue.filter((Value: any)  => {
      if (searchText) {
        const searchValue = searchText.toLowerCase();
        if (Value) {
          console.log(Value)
            const firstName = Value.sidemenu.TARGETNAME.toLowerCase();
            return (firstName.indexOf(searchValue) > -1 );
        } else {
          return false;
        }
      } else {
        return true;
      }
  });
  }

}
