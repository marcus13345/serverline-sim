export default function() {
  console.log(`Vogue Kernel Commands

  save               : Save the current state of the system to the disk

  reset              : Wipe the state of the system

  create m <n> <i>   : Create a new Instance of a given module
      m              : The FQDN of the module
     <n>             : An alias for the created instance
     <i>             : A pre-set Id for the module

  ls                 : Lists the current instances

  script f           : Executes a script
      f              : The path to the script

  set v ...d         : Set a kernel variable
      v              : The name of the variable
   ...d              : The value (or values, space delimited)
`)
}