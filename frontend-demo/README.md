###### Metropolis Material Management

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.13.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help
  
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

# test

## How to add pwa to angular

https://medium.com/ngconf/angular-pwa-install-and-configure-858dd8e9fb07

teasting 18

#test

##test

#####test

POC

## tests

## webhook triger

Last login: Thu Jul  9 10:13:41 2026 from 125.20.236.134
[ec2-user@ip-10-0-1-95 ~]$ df -h
Filesystem        Size  Used Avail Use% Mounted on
devtmpfs          918M     0  918M   0% /dev
tmpfs             955M     0  955M   0% /dev/shm
tmpfs             382M  484K  382M   1% /run
efivarfs          128K  2.7K  121K   3% /sys/firmware/efi/efivars
/dev/nvme0n1p1    8.0G  4.0G  4.0G  51% /
tmpfs             955M  4.8M  950M   1% /tmp
/dev/nvme0n1p128   10M  1.3M  8.7M  13% /boot/efi
tmpfs             191M     0  191M   0% /run/user/1000



      382M  484K  382M   1% /run
efivarfs          128K  2.7K  121K   3% /sys/firmware/efi/efivars
/dev/nvme0n1p1    8.0G  4.0G  4.0G  51% /
tmpfs             955M  4.8M  950M   1% /tmp
/dev/nvme0n1p128   10M  1.3M  8.7M  13% /boot/efi
tmpfs             191M     0  191M   0% /run/user/1000


## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help
  
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

        stage('Deploy') {
            steps {
                sh '''
                docker stop frontend || true
                docker rm frontend || true

                docker run -d \
                --name frontend \
                -p 8081:80 \
                $REPOSITORY:latest
                '''
            }
        }
    }
}