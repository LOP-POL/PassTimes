test_string = '10101'
import math
from functools import reduce

def binary_to_dec(binary_string):
    dec_list = []
    
    for i in enumerate(binary_string):
        math.pow(2,i[0])
        digit = math.pow(2,i[0]) * float(i[1])
        dec_list.append(digit)

    print(reduce(lambda x,y:x+y,dec_list))
        # dec_list.append(digit)


binary_to_dec(test_string)


test_list = [1,2,3,4,5,6,7,8,9,10,11,12,13,14]

def primeNumberRemove(my_list):
    
    primeList = [2,3,5,7]
  
    final_list = []
    for i in my_list:
        Prime = True
        for j in primeList:
            if i%j == 0 and not i == j:
                Prime = False
        if Prime:
            final_list.append(i)
            
                
    
    return final_list

print(primeNumberRemove(test_list))
            



        
    
    
    
    





    